import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { pick } from '@react-native-documents/picker';
import { colors } from '../theme/colors';
import { sendFile } from '../features/transfer/tcpTransferService';
import { transferStarted, transferProgressed, transferFinished } from '../features/transfer/transferSlice';
import { TransferProgressView } from '../components/TransferProgressView';
import { TransferCompleteView } from '../components/TransferCompleteView';

type Stage = 'picking' | 'sending' | 'done' | 'failed';

export function FilePickerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const device = route.params?.device;

  const [stage, setStage] = useState<Stage>('picking');
  const [file, setFile] = useState<{ uri: string; name: string; size: number } | null>(null);
  const [bytesSent, setBytesSent] = useState(0);
  const [cancelFn, setCancelFn] = useState<(() => void) | null>(null);

  const handlePick = async () => {
    try {
      const [result] = await pick({ mode: 'import' });
      setFile({ uri: result.uri, name: result.name ?? 'file', size: result.size ?? 0 });
    } catch {
      // user cancelled the picker
    }
  };

  const handleSend = async () => {
    if (!file) return;
    setStage('sending');
    dispatch(
      transferStarted({
        id: `${Date.now()}`,
        direction: 'sent',
        deviceName: device.name,
        fileName: file.name,
        fileSizeBytes: file.size,
        bytesTransferred: 0,
        status: 'in-progress',
        startedAt: Date.now(),
        completedAt: 0
      }),
    );

    const { promise, cancel } = sendFile({
      host: device.host,
      port: device.port,
      filePath: file.uri,
      fileName: file.name,
      fileSize: file.size,
      onProgress: sent => {
        setBytesSent(sent);
        dispatch(transferProgressed({ bytesTransferred: sent }));
      },
    });
    setCancelFn(() => cancel);

    try {
      await promise;
      dispatch(transferFinished({ status: 'completed' }));
      setStage('done');
    } catch {
      dispatch(transferFinished({ status: 'failed' }));
      setStage('failed');
    }
  };

  if (stage === 'sending') {
    return (
      <View style={styles.screen}>
        <TransferProgressView
          peerName={device.name}
          fileName={file!.name}
          fileSizeBytes={file!.size}
          bytesTransferred={bytesSent}
          direction="sent"
          onCancel={() => {
            cancelFn?.();
            navigation.goBack();
          }}
        />
      </View>
    );
  }

  if (stage === 'done') {
    return (
      <View style={styles.screen}>
        <TransferCompleteView
          fileName={file!.name}
          peerName={device.name}
          direction="sent"
          onDone={() => navigation.navigate('Home')}
        />
      </View>
    );
  }

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
        <Pressable style={styles.pickTile} onPress={handlePick}>
          <Text style={styles.pickIcon}>{'\u25A3'}</Text>
          <Text style={styles.pickText}>Choose a file</Text>
        </Pressable>

        {file && (
          <View style={styles.fileRow}>
            <View style={styles.fileIcon}>
              <Text style={styles.fileIconGlyph}>{'\u25A4'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</Text>
            </View>
          </View>
        )}

        {stage === 'failed' && <Text style={styles.errorText}>Transfer failed — try again</Text>}
      </View>

      {file && (
        <View style={styles.footer}>
          <Pressable style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>Send file</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14 },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backGlyph: { fontSize: 16, color: colors.muted },
  title: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.ink },
  content: { flex: 1, paddingHorizontal: 18 },
  pickTile: { borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 14, paddingVertical: 28, alignItems: 'center', gap: 8, marginBottom: 16, backgroundColor: colors.card },
  pickIcon: { fontSize: 24, color: colors.signal },
  pickText: { fontFamily: 'OpenSans-SemiBold', fontSize: 13, color: colors.muted },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 },
  fileIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.amberDim, alignItems: 'center', justifyContent: 'center' },
  fileIconGlyph: { fontSize: 16, color: '#B9760E' },
  fileName: { fontFamily: 'OpenSans-SemiBold', fontSize: 13, color: colors.ink },
  fileSize: { fontFamily: 'JetBrainsMono-Regular', fontSize: 11, color: colors.muted },
  errorText: { fontFamily: 'OpenSans-Regular', fontSize: 12.5, color: colors.danger, marginTop: 12 },
  footer: { padding: 18 },
  sendBtn: { backgroundColor: colors.signal, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  sendBtnText: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#fff' },
});