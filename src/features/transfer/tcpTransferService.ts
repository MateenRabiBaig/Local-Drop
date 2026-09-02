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

    const promise = new Promise((resolve, reject) => {
        const client = TcpSockets.connectTLS({ host, port }, async() => {
            const header = JSON.stringify({ fileName, fileSize }) + '\n';
            client.write(header, 'utf8');

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
        });
        clientRef = client;
        client.on('error', err => reject(err));
        client.on('close', () => resolve());
    });

    return { promise, cancel: () => clientRef?.destroy() };
}

interface ReceiverCallbacks {
    onProgress: (bytesReceived: number, fileSize: number) => void;
    onComplete: (filePath: string, fileName: string) => void;
    onError: (err: Error) => void;
}

export function startReceiverServer(callbacks: ReceiverCallbacks) {
    const server = TcpSockets.createTLSServer(socket => {
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

        socket.on('data', (data: string | Buffer) => {
            const chunk = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
            
            if(!headerParsed) {
                headerBuffer = Buffer.concat([headerBuffer, chunk]);
                const newlineIndex = headerBuffer.indexOf(0x0a);
                if(newlineIndex === -1) return;

                const header = JSON.parse(headerBuffer.subarray(0, newlineIndex).toString('utf8'));
                fileName = header.fileName;
                fileSize = header.fileSize;
                filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
                headerParsed = true;

                writeQueue = writeQueue.then(async() => {
                    const exists = await RNFS.exists(filePath);
                    if(exists) await RNFS.unlink(filePath);
                    await RNFS.writeFile(filePath, '', 'utf8');
                });

                const remaining = headerBuffer.subarray(newlineIndex + 1);
                if(remaining.length > 0) appendChunk(Buffer.from(remaining));
                return;
            }
            appendChunk(chunk);
        });
        socket.on('error', err => callbacks.onError(err));
    });
    server.listen({ port: TRANSFER_PORT, host: '0.0.0.0' });
    return server;
}