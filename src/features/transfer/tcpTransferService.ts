import TcpSockets from 'react-native-tcp-socket';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';

export const TRANSFER_PORT = 52999;
const CHUNK_SIZE = 64 * 1024;

// Certs are bundled as raw Android assets (android/app/src/main/assets/certs)
// and copied to a real file so the native TLS code can read them via a file://
// URI. Metro asset URIs only work in dev (Metro HTTP); release builds resolve
// to file:///android_res/... which the library cannot open.
const CERT_DIR = `${RNFS.CachesDirectoryPath}/certs`;

async function ensureCertFile(name: string): Promise<string> {
    if (!(await RNFS.exists(CERT_DIR))) {
        await RNFS.mkdir(CERT_DIR);
    }
    const dest = `${CERT_DIR}/${name}`;
    await RNFS.copyFileAssets(`certs/${name}`, dest);
    return `file://${dest}`;
}

function normalizeChunk(data: unknown): Buffer {
    if (Buffer.isBuffer(data)) return data;
    if (data instanceof Uint8Array) return Buffer.from(data);
    if (Array.isArray(data)) return Buffer.from(data);
    if (data && typeof data === 'object' && typeof (data as { length?: unknown }).length === 'number') {
        return Buffer.from(Array.from(data as ArrayLike<number>));
    }
    if (typeof data === 'string') return Buffer.from(data, 'utf8');
    throw new Error(`Unexpected socket data type: ${typeof data}`);
}

interface SendFileOptions {
    host: string;
    port: number;
    filePath: string;
    fileName: string;
    fileSize: number;
    onProgress: (bytesSent: number) => void;
}

interface SendFileHandle {
  promise: Promise<void>;
  cancel: () => void;
}

export function sendFile(opts: SendFileOptions): SendFileHandle {
    const { host, port, filePath, fileName, fileSize, onProgress } = opts;
    let clientRef: ReturnType<typeof TcpSockets.connectTLS> | null = null;
    let accepted = false;
    let settled = false;
    let position = 0;

    const promise = ensureCertFile('server-cert.pem').then(caUri => new Promise<void>((resolve, reject) => {
        const client = TcpSockets.connectTLS({ host, port, ca: { uri: caUri } }, () => {
            const header = JSON.stringify({ fileName, fileSize }) + '\n';
            client.write(header, 'utf8');

            let awaitingDecision = true;

            const onFirstData = (data: unknown) => {
                if(!awaitingDecision) return;
                awaitingDecision = false;
                client.removeListener('data', onFirstData);

                const byteBuffer = normalizeChunk(data);
                const byte = byteBuffer[0];
                if(byte !== 1) {
                    reject(new Error('declined'));
                    client.destroy();
                    return;
                }
                accepted = true;

            const sendNextChunk = async() => {
                if(position >= fileSize) {
                    client.end();
                    return;
                }
                try {
                    const base64Chunk = await RNFS.read(filePath, CHUNK_SIZE, position, 'base64');
                    const buffer = Buffer.from(base64Chunk, 'base64');

                    const canContinue = client.write(buffer);
                    position += buffer.length;
                    onProgress(position);

                    if(canContinue) {
                        sendNextChunk();
                    }
                    else {
                        client.once('drain', sendNextChunk);
                    }
                }
                catch(err) {
                    reject(err);
                    client.destroy();
                }
            };
            sendNextChunk();
        };
        client.on('data', onFirstData);
        });
        clientRef = client;
        client.on('error', err => reject(err));
        client.on('close', () => {
            if (settled) return;
            settled = true;
            if (accepted && position >= fileSize) {
                resolve();
            } else {
                reject(new Error('Transfer ended before completion'));
            }
        });
    }));

    return { promise, cancel: () => clientRef?.destroy() };
}

interface ReceiverCallbacks {
    onIncomingRequest: (
        fileName: string,
        fileSize: number,
        respond: (accepted: boolean) => void | Promise<void>,
    ) => void;
    onProgress: (bytesReceived: number, fileSize: number) => void;
    onComplete: (filePath: string, fileName: string) => void;
    onError: (err: Error) => void;
}

export async function startReceiverServer(callbacks: ReceiverCallbacks) {
    const keystoreUri = await ensureCertFile('server-keystore.p12');
    const server = TcpSockets.createTLSServer(
        // react-native-tcp-socket hardcodes an empty password when loading the
        // keystore natively, so server-keystore.p12 must be exported with no password.
        { keystore: { uri: keystoreUri } } as Parameters<typeof TcpSockets.createTLSServer>[0],
        socket => {
        let headerParsed = false;
        let headerBuffer = Buffer.alloc(0);
        let fileName = '';
        let fileSize = 0;
        let bytesReceived = 0;
        let filePath = '';
        let transferCompleted = false;
        let dataShapeLogged = false;

        let writeQueue: Promise<void> = Promise.resolve();

        const appendChunk = (chunk: Buffer) => {
            writeQueue = writeQueue.then(async() => {
                await RNFS.appendFile(filePath, chunk.toString('base64'), 'base64');
                bytesReceived += chunk.length;
                callbacks.onProgress(bytesReceived, fileSize);

                if(!transferCompleted && bytesReceived >= fileSize) {
                    transferCompleted = true;
                    callbacks.onComplete(filePath, fileName);
                    socket.end();
                }
            });
        };

        let accepted = false;

        socket.on('data', (data: unknown) => {
            if (!dataShapeLogged) {
                dataShapeLogged = true;
                console.log('[DEBUG data shape]', {
                    type: typeof data,
                    isBuffer: Buffer.isBuffer(data),
                    isUint8Array: data instanceof Uint8Array,
                    isArray: Array.isArray(data),
                    hasLength: !!data && typeof (data as { length?: unknown }).length === 'number',
                    hex: normalizeChunk(data).toString('hex').slice(0, 32),
                });
            }
            const chunk = normalizeChunk(data);
            
            if(!headerParsed) {
                headerBuffer = Buffer.concat([headerBuffer, chunk]);
                const newlineIndex = headerBuffer.indexOf(0x0a);
                if(newlineIndex === -1) return;

                // Avoid Buffer.subarray: under Hermes it returns a plain Uint8Array
                // (Symbol.species unsupported), whose toString() joins decimals
                // instead of decoding utf8.
                const headerText = headerBuffer.toString('utf8', 0, newlineIndex).trim();
                const jsonStart = headerText.indexOf('{');
                const jsonEnd = headerText.lastIndexOf('}');
                const jsonText = jsonStart >= 0 && jsonEnd > jsonStart
                    ? headerText.slice(jsonStart, jsonEnd + 1)
                    : headerText;
                let header: { fileName?: unknown; fileSize?: unknown };

                try {
                    header = JSON.parse(jsonText);
                } catch {
                    callbacks.onError(new Error(`Invalid transfer header: ${headerText}`));
                    socket.destroy();
                    return;
                }

                const parsedFileSize = typeof header.fileSize === 'number'
                    ? header.fileSize
                    : typeof header.fileSize === 'string'
                        ? Number(header.fileSize)
                        : NaN;

                if (
                    typeof header.fileName !== 'string' ||
                    !Number.isFinite(parsedFileSize) ||
                    parsedFileSize < 0
                ) {
                    callbacks.onError(new Error('Invalid transfer header fields'));
                    socket.destroy();
                    return;
                }

                fileName = header.fileName;
                fileSize = parsedFileSize;
                filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
                headerParsed = true;

                callbacks.onIncomingRequest(fileName, fileSize, async (userAccepted: boolean) => {
                    accepted = userAccepted;
                    if(!accepted) {
                        socket.write(Buffer.from([0]));
                        socket.end();
                        return;
                    }
                    const exists = await RNFS.exists(filePath);
                    if(exists) await RNFS.unlink(filePath);
                    await RNFS.writeFile(filePath, '', 'utf8');
                    socket.write(Buffer.from([1]));
                    if (fileSize === 0) {
                        transferCompleted = true;
                        callbacks.onComplete(filePath, fileName);
                        socket.end();
                    }
                });
                return;
            }
            if(accepted) appendChunk(chunk);
        });
        socket.on('error', err => {
            writeQueue = writeQueue.then(async () => {
                if (filePath && (await RNFS.exists(filePath)) && bytesReceived < fileSize) {
                    await RNFS.unlink(filePath);
                }
            });
            callbacks.onError(err);
        });
        },
    );
    server.on('error', callbacks.onError);
    server.listen({ port: TRANSFER_PORT, host: '0.0.0.0' });
    return server;
}
