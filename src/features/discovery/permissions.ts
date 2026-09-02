import { Platform } from 'react-native';
import { PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';

export async function requestDiscoveryPermissions(): Promise<boolean> {
    // iOS local-network access is requested by Bonjour when scanning starts;
    // react-native-permissions does not expose a LOCAL_NETWORK constant.
    if (Platform.OS === 'ios') return true;

    const permissions = [PERMISSIONS.ANDROID.NEARBY_WIFI_DEVICES];
    const results = await requestMultiple(permissions);

    return Object.values(results).every(r => r === RESULTS.GRANTED || r === RESULTS.LIMITED);
}
