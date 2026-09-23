import Zeroconf from 'react-native-zeroconf';
import { Device } from '../../types';

interface DiscoveredService {
    name: string;
    host?: string;
    addresses?: string[];
    port: number;
    txt?: Record<string, string>;
}

const SERVICE_TYPE = 'localdrop';
const SERVICE_PROTOCOL = 'tcp';
const DOMAIN = 'local.';

type Listener = (device: Device) => void;
type LostListener = (id: string) => void;

class ZeroconfService {
    private zeroconf = new Zeroconf();
    private foundListeners: Listener[] = [];
    private lostListeners: LostListener[] = [];
    private started = false;

    private mapService(service: DiscoveredService): Device | null {
        // Android's mDNS resolver gives us both a hostname and the resolved
        // address. Prefer IPv4 here: .local hostnames are not consistently
        // resolvable by Android's TCP stack, especially on emulators.
        const ipv4 = service.addresses?.find(address =>
            /^\d{1,3}(?:\.\d{1,3}){3}$/.test(address),
        );
        const host = ipv4 || service.host;
        if (!host || !service.port) return null;
        return {
            id: service.name,
            name: service.txt?.displayName || service.name,
            host,
            port: service.port,
            lastSeen: Date.now(),
        };
    }

    start() {
        if(this.started) return;
        this.started = true;

        this.zeroconf.on('resolved', (service: DiscoveredService) => {
            const device = this.mapService(service);
            if (device) this.foundListeners.forEach(cb => cb(device));
        });

        this.zeroconf.on('remove', (name: string) => {
            this.lostListeners.forEach(cb => cb(name));
        });

        this.zeroconf.on('error', (err: Error) => {
            console.warn('[Zeroconf] error', err);
        });
    }

    scan() {
        this.start();
        this.zeroconf.scan(SERVICE_TYPE, SERVICE_PROTOCOL, DOMAIN);
    }

    stopScan() {
        this.zeroconf.stop();
    }

    publish(displayName: string, port: number) {
        this.start();
        const instanceName = `${displayName}-${Math.random().toString(36).slice(2,6)}`;
        this.zeroconf.publishService(SERVICE_TYPE, SERVICE_PROTOCOL, DOMAIN, instanceName, port, {displayName});
        return instanceName;
    }

    unpublish(instanceName: string) {
        this.zeroconf.unpublishService(instanceName);
    }

    onDeviceFound(cb: Listener) {
        this.foundListeners.push(cb);
        return () => {
            this.foundListeners = this.foundListeners.filter(l => l !== cb);
        };
    }

    onDeviceLost(cb: LostListener) {
        this.lostListeners.push(cb);
        return () => {
            this.lostListeners = this.lostListeners.filter(l => l !== cb)
        };
    }
}

export const zeroconfService = new ZeroconfService();
