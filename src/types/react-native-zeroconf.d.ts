declare module 'react-native-zeroconf' {
    interface ZeroconfService {
        name: string;
        host?: string;
        port: number;
        txt?: Record<string, string>;
    }

    type ZeroconfEventPayloads = {
        resolved: ZeroconfService;
        remove: string;
        error: Error;
    };

    class Zeroconf {
        on<Event extends keyof ZeroconfEventPayloads>(
            event: Event,
            listener: (payload: ZeroconfEventPayloads[Event]) => void,
        ): void;
        scan(type: string, protocol: string, domain: string): void;
        stop(): void;
        publishService(
            type: string,
            protocol: string,
            domain: string,
            name: string,
            port: number,
            txt?: Record<string, string>,
        ): void;
        unpublishService(name: string): void;
    }

    export default Zeroconf;
}
