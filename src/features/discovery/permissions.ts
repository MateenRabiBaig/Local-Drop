import { Platform } from 'react-native';
import { PERMISSIONS, RESULTS, request, requestMultiple } from 'react-native-permissions';

export async function requestDiscoveryPermissions(): Promise<boolean> {
    if(Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.LOCAL_NETWORK);
        return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
    }

    const permissions = [PERMISSIONS.ANDROID.NEARBY_WIFI_DEVICES];
    const results = await requestMultiple(permissions);

    return Object.values(results).every(r => r === RESULTS.GRANTED || r === RESULTS.LIMITED);
}