import TcpSockets from 'react-native-tcp-socket';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';

export const TRANSFER_PORT = 52999;
const CHUNK_SIZE = 64 * 1024;

const SERVER_KEYSTORE = require('../../assets/certs/server-keystore.p12');
const SERVER_CERT = require('../../assets/certs/server-cert.pem');

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

    const promise = new Promise<void>((resolve, reject) => {
        const client = TcpSockets.connectTLS({ host, port, ca: SERVER_CERT }, () => {
            const header = JSON.stringify({ fileName, fileSize }) + '\n';
            client.write(header, 'utf8');

            let awaitingDecision = true;

            const onFirstData = (data: unknown) => {
                if(!awaitingDecision) return;
                awaitingDecision = false;
                client.removeListener('data', onFirstData);

                const byteBuffer = typeof data === 'string'
                    ? Buffer.from(data, 'utf8')
                    : Buffer.from(data as Uint8Array);
                const byte = byteBuffer[0];
                if(byte! == 1) {
                    reject(new Error('declined'));
                    client.destroy();
                    return;
                }

            let position = 0;

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
        client.on('close', () => resolve());
    });

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

export function startReceiverServer(callbacks: ReceiverCallbacks) {
    const server = TcpSockets.createTLSServer({ keystore: SERVER_KEYSTORE },socket => {
        let headerParsed = false;
        let headerBuffer = Buffer.alloc(0);
        let fileName = '';
        let fileSize = 0;
        let bytesReceived = 0;
        let filePath = '';

        let writeQueue: Promise<void> = Promise.resolve();

        const appendChunk = (chunk: Buffer) => {
            writeQueue = writeQueue.then(async() => {
                await RNFS.appendFile(filePath, chunk.toString('base64'), 'base64');
                bytesReceived += chunk.length;
                callbacks.onProgress(bytesReceived, fileSize);

                if(bytesReceived >= fileSize) {
                    callbacks.onComplete(filePath, fileName);
                    socket.end()
                }
            });
        };

        let accepted = false;

        socket.on('data', (data: unknown) => {
            const chunk = typeof data === 'string'
                ? Buffer.from(data, 'utf8')
                : Buffer.from(data as Uint8Array);
            
            if(!headerParsed) {
                headerBuffer = Buffer.concat([headerBuffer, chunk]);
                const newlineIndex = headerBuffer.indexOf(0x0a);
                if(newlineIndex === -1) return;

                const header = JSON.parse(headerBuffer.subarray(0, newlineIndex).toString());
                fileName = header.fileName;
                fileSize = header.fileSize;
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
                });
                return;
            }
            if(accepted) appendChunk(chunk);
        });
        socket.on('error', err => callbacks.onError(err));
    });
    server.listen({ port: TRANSFER_PORT, host: '0.0.0.0' });
    return server;
}
