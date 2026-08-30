import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { sendFile } from '../features/transfer/tcpTransferService';
import { ensureTestFile } from '../features/transfer/testFile';

export function FilePickerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const device = route.params?.device;
  const [status, setStatus] = useState('Ready to send test file');
  const [progress, setProgress] = useState(0);

  const handleSend = async () => {
    try {
      const { path, size } = await ensureTestFile();
      setStatus('Sending…');
      await sendFile({
        host: device.host,
        port: device.port,
        filePath: path,
        fileName: 'localdrop-test.txt',
        fileSize: size,
        onProgress: sent => setProgress(Math.round((sent / size) * 100)),
      });
      setStatus('Sent successfully');
    }
    catch (err: any) {
      setStatus(`Failed: ${err.message}`);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topbar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backGlyph}>{'\u2190'}</Text>
        </Pressable>
        <Text style={styles.title}>Send to {device?.name}</Text>
        <View style={{ width: 34 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.progress}>{progress}%</Text>
        <Pressable style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>Send test file</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14 },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backGlyph: { fontSize: 16, color: colors.muted },
  title: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.ink },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  status: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.ink, marginBottom: 8 },
  progress: { fontFamily: 'JetBrainsMono-Regular', fontSize: 13, color: colors.muted, marginBottom: 24 },
  sendBtn: { backgroundColor: colors.signal, paddingVertical: 13, paddingHorizontal: 32, borderRadius: 12 },
  sendBtnText: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#fff' },
});