import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'localdrop:deviceName';

export async function loadDeviceName(): Promise<string | null> {
  return AsyncStorage.getItem(KEY);
}

export async function saveDeviceName(name: string): Promise<void> {
  await AsyncStorage.setItem(KEY, name);
}