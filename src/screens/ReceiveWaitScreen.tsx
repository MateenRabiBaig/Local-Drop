import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { colors } from '../theme/colors';
import { zeroconfService } from '../features/discovery/zeroconfService';
import { startReceiverServer, TRANSFER_PORT } from '../features/transfer/tcpTransferService';
import { transferStarted, transferProgressed, transferFinished } from '../features/transfer/transferSlice';
import { TransferProgressView } from '../components/TransferProgressView';
import { TransferCompleteView } from '../components/TransferCompleteView';

type Stage = 'waiting' | 'receiving' | 'done';

export function ReceiveWaitScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [stage, setStage] = useState<Stage>('waiting');
  const [fileInfo, setFileInfo] = useState({ name: '', size: 0, received: 0 });

  useFocusEffect(
    useCallback(() => {
      const instanceName = zeroconfService.publish('This Device', TRANSFER_PORT);
      let started = false;

      const server = startReceiverServer({
        onIncomingRequest: (_fileName, _fileSize, respond) => respond(true),
        onProgress: (bytesReceived, fileSize) => {
          if (!started) {
            started = true;
            setStage('receiving');
            dispatch(
              transferStarted({
                id: `${Date.now()}`,
                direction: 'received',
                deviceName: 'Sender',
                fileName: fileInfo.name,
                fileSizeBytes: fileSize,
                bytesTransferred: 0,
                status: 'in-progress',
                startedAt: Date.now(),
                completedAt: 0
              }),
            );
          }
          setFileInfo(prev => ({ ...prev, size: fileSize, received: bytesReceived }));
          dispatch(transferProgressed({ bytesTransferred: bytesReceived }));
        },
        onComplete: (filePath, fileName) => {
          setFileInfo(prev => ({ ...prev, name: fileName }));
          dispatch(transferFinished({ status: 'completed' }));
          setStage('done');
        },
        onError: () => {
          dispatch(transferFinished({ status: 'failed' }));
        },
      });

      return () => {
        server.close();
        zeroconfService.unpublish(instanceName);
      };
    }, [dispatch, fileInfo.name]),
  );

  if (stage === 'receiving') {
    return (
      <View style={styles.screen}>
        <TransferProgressView
          peerName="Sender"
          fileName={fileInfo.name || 'Incoming file'}
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
        <Text style={styles.heroSub}>Your device is visible to others on this Wi-Fi</Text>
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
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  radarBig: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: colors.amber, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  core: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.amberDim, alignItems: 'center', justifyContent: 'center' },
  coreGlyph: { fontSize: 24, color: '#B9760E' },
  heroTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.ink, textAlign: 'center', marginBottom: 4 },
  heroSub: { fontFamily: 'OpenSans-Regular', fontSize: 12.5, color: colors.muted, textAlign: 'center' },
});
