import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';

interface Props {
  peerName: string;
  fileName: string;
  fileSizeBytes: number;
  bytesTransferred: number;
  direction: 'sent' | 'received';
  onCancel?: () => void;
}

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TransferProgressView({
  peerName,
  fileName,
  fileSizeBytes,
  bytesTransferred,
  direction,
  onCancel,
}: Props) {
  const pct = fileSizeBytes > 0 ? Math.min(bytesTransferred / fileSizeBytes, 1) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - pct);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{direction === 'sent' ? `Sending to ${peerName}` : `Receiving from ${peerName}`}</Text>

      <View style={styles.ringWrap}>
        <Svg width={180} height={180} viewBox="0 0 180 180">
          <Defs>
            <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.signal} />
              <Stop offset="100%" stopColor={colors.purple} />
            </LinearGradient>
          </Defs>
          <Circle cx={90} cy={90} r={RADIUS} stroke={colors.border} strokeWidth={12} fill="none" />
          <Circle
            cx={90}
            cy={90}
            r={RADIUS}
            stroke="url(#ringGrad)"
            strokeWidth={12}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation={-90}
            origin="90, 90"
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.ringPct}>{Math.round(pct * 100)}%</Text>
          <Text style={styles.ringSub}>{formatBytes(bytesTransferred)} / {formatBytes(fileSizeBytes)}</Text>
        </View>
      </View>

      <Text style={styles.fileName}>{fileName}</Text>
      <Text style={styles.fileTotal}>{formatBytes(fileSizeBytes)} total</Text>

      {onCancel && (
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel transfer</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 24 },
  label: { fontFamily: 'OpenSans-Regular', fontSize: 12.5, color: colors.muted, marginBottom: 20 },
  ringWrap: { width: 180, height: 180, marginBottom: 22 },
  ringCenter: { position: 'absolute', width: 180, height: 180, alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontFamily: 'Poppins-SemiBold', fontSize: 30, color: colors.ink },
  ringSub: { fontFamily: 'JetBrainsMono-Regular', fontSize: 10.5, color: colors.muted, marginTop: 2 },
  fileName: { fontFamily: 'Poppins-SemiBold', fontSize: 15, color: colors.ink, marginBottom: 2 },
  fileTotal: { fontFamily: 'JetBrainsMono-Regular', fontSize: 11.5, color: colors.muted, marginBottom: 24 },
  cancelBtn: { borderWidth: 1, borderColor: colors.danger, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28, marginTop: 8 },
  cancelText: { fontFamily: 'Poppins-SemiBold', fontSize: 13.5, color: colors.danger },
});