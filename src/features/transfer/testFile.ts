import RNFS from 'react-native-fs';

export const TEST_FILE_NAME = 'localdrop-text.txt';

export async function ensureTestFile(): Promise<{ path: string; size: number }> {
    const path = `${RNFS.DocumentDirectoryPath}/${TEST_FILE_NAME}`;
    const content = 'LocalDrop test file.\n'.repeat(2000);
    await RNFS.writeFile(path, content, 'utf8');
    const stat = await RNFS.stat(path);
    return { path, size: stat.size };
}