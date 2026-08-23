export interface Device {
    id: string;
    name: string;
    host: string;
    port: number;
    lastSeen: number;
}

export interface Transfer {
    id: string;
    direction: 'sent' | 'received';
    deviceName: string;
    fileName: string;
    fileSizeBytes: number;
    bytesTransferred: number;
    status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
    startedAt: number;
    completedAt: number;
}

export interface Settings {
    deviceName: string;
    certFingerprint: string;
    downloadPath: string;
}