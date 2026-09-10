import { sendFile } from "./tcpTransferService";

export interface QueueFile {
    uri: string;
    name: string;
    size: number;
}

interface SendQueueOptions {
    host: string;
    port: number;
    files: QueueFile[];
    onFileProgress: (fileIndex: number, bytesSent: number) => void;
    onFileDone: (fileIndex: number, status: 'completed' | 'failed') => void;
}

interface QueueHandle {
    promise: Promise<void>;
    cancel: () => void;
}

export function sendFileQueue(opts: SendQueueOptions): QueueHandle {
    const { host, port, files, onFileProgress, onFileDone } = opts;
    let cancelled = false;
    let currentCancel : (() => void) | null = null;

    const promise = (async () => {
        for(let i=0;i<files.length;i++) {
            if(cancelled) return;
            const file = files[i];
            const { promise: filePromise, cancel } = sendFile({ host, port, filePath: file.uri, fileName: file.name, fileSize: file.size, onProgress: sent => onFileProgress(i,sent) });
            currentCancel = cancel;

            try {
                await filePromise;
                onFileDone(i, 'completed');
            }
            catch {
                onFileDone(i, 'failed');
            }
        }
    })();

    return { promise, cancel: () => { cancelled = true; currentCancel?.(); } }
}