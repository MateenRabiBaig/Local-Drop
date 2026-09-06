import React, { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import { zeroconfService } from '../features/discovery/zeroconfService';
import { startReceiverServer, TRANSFER_PORT } from '../features/transfer/tcpTransferService';
import { transferStarted, transferProgressed, transferFinished } from '../features/transfer/transferSlice';
import { TransferProgressView } from '../components/TransferProgressView';
import { TransferCompleteView } from '../components/TransferCompleteView';
import type { RootState } from '../app/store';

type Stage = 'waiting' | 'incoming' | 'receiving' | 'done';

export function ReceiveWaitScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const deviceName = useSelector((s: RootState) => s.settings.deviceName);

  const [stage, setStage] = useState<Stage>('waiting');
  const [fileInfo, setFileInfo] = useState({ name: '', size: 0, received: 0 });
  const [respondFn, setRespondFn] = useState<((accepted: boolean) => void) | null>(null);

  useFocusEffect(
    useCallback(() => {
      const instanceName = zeroconfService.publish(deviceName, TRANSFER_PORT);

      const server = startReceiverServer({
        onIncomingRequest: (fileName, fileSize, respond) => {
          setFileInfo({ name: fileName, size: fileSize, received: 0 });
          setRespondFn(() => respond);
          setStage('incoming');
        },
        onProgress: (bytesReceived, fileSize) => {
          setStage(current => (current === 'incoming' ? 'receiving' : current));
          setFileInfo(prev => ({ ...prev, size: fileSize, received: bytesReceived }));
          dispatch(transferProgressed({ bytesTransferred: bytesReceived }));
        },
        onComplete: (filePath, fileName) => {
          dispatch(transferFinished({ status: 'completed' }));
          setFileInfo(prev => ({ ...prev, name: fileName }));
          setStage('done');
        },
        onError: () => {
          dispatch(transferFinished({ status: 'failed' }));
          setStage('waiting');
        },
      });

      return () => {
        server.close();
        zeroconfService.unpublish(instanceName);
      };
    }, [dispatch, deviceName]),
  );

  const handleAccept = () => {
    dispatch(
      transferStarted({
        id: `${Date.now()}`,
        direction: 'received',
        deviceName: 'Sender',
        fileName: fileInfo.name,
        fileSizeBytes: fileInfo.size,
        bytesTransferred: 0,
        status: 'in-progress',
        startedAt: Date.now(),
        completedAt: 0
      }),
    );
    respondFn?.(true);
    setStage('receiving');
  };

  const handleDecline = () => {
    respondFn?.(false);
    setStage('waiting');
  };

  if (stage === 'receiving') {
    return (
      <View style={styles.screen}>
        <TransferProgressView
          peerName="Sender"
          fileName={fileInfo.name}
          fileSizeBytes={fileInfo.size}
          bytesTransferred={fileInfo.received}
          direction="received"
        />
      </View>
    );
  }

  if (stage === 'done') {
    return (
      <View style={styles.screen}>
        <TransferCompleteView
          fileName={fileInfo.name}
          peerName="Sender"
          direction="received"
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
        <Text style={styles.title}>Receive a file</Text>
        <View style={{ width: 34 }} />
      </View>
      <View style={styles.hero}>
        <View style={styles.radarBig}>
          <View style={styles.core}>
            <Text style={styles.coreGlyph}>{'\u2193'}</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>Waiting to receive…</Text>
        <Text style={styles.heroSub}>Visible as "{deviceName}" to others on this Wi-Fi</Text>
      </View>

      <Modal visible={stage === 'incoming'} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Pressable style={styles.modalClose} onPress={handleDecline}>
              <Text style={styles.modalCloseText}>{'\u2715'}</Text>
            </Pressable>
            <View style={styles.modalAvatar}>
              <Text style={styles.modalAvatarGlyph}>{'\u25A4'}</Text>
            </View>
            <Text style={styles.modalTitle}>Incoming file</Text>
            <Text style={styles.modalBody}>
              {fileInfo.name} · {(fileInfo.size / 1024).toFixed(1)} KB
            </Text>
            <View style={styles.modalRow}>
              <Pressable style={styles.declineBtn} onPress={handleDecline}>
                <Text style={styles.declineText}>Decline</Text>
              </Pressable>
              <Pressable style={styles.acceptBtn} onPress={handleAccept}>
                <Text style={styles.acceptText}>Accept</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14 },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backGlyph: { fontSize: 16, color: colors.muted },
  title: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.ink },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  radarBig: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: colors.amber, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  core: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.amberDim, alignItems: 'center', justifyContent: 'center' },
  coreGlyph: { fontSize: 24, color: '#B9760E' },
  heroTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.ink, textAlign: 'center', marginBottom: 4 },
  heroSub: { fontFamily: 'OpenSans-Regular', fontSize: 12.5, color: colors.muted, textAlign: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(20,23,31,0.55)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  modalCard: { width: '100%', backgroundColor: colors.card, borderRadius: 22, padding: 24, alignItems: 'center' },
  modalClose: { position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { fontSize: 12, color: colors.muted },
  modalAvatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.purpleDim, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  modalAvatarGlyph: { fontSize: 22, color: colors.purple },
  modalTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 17, color: colors.ink, marginBottom: 6 },
  modalBody: { fontFamily: 'JetBrainsMono-Regular', fontSize: 12, color: colors.muted, marginBottom: 20 },
  modalRow: { flexDirection: 'row', gap: 10, width: '100%' },
  declineBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  declineText: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: colors.ink },
  acceptBtn: { flex: 1, backgroundColor: colors.signal, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  acceptText: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#fff' },
});