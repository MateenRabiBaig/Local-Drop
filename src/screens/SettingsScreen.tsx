import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import type { RootState } from '../app/store';
import { deviceNameSet } from '../features/settings/settingsSlice';
import { saveDeviceName } from '../features/settings/settingsStorage';
import { historyCleared } from '../features/transfer/transferSlice';

export function SettingsScreen() {
  const dispatch = useDispatch();
  const { deviceName, certFingerprint, downloadPath } = useSelector((s: RootState) => s.settings);
  const historyCount = useSelector((s: RootState) => s.transfer.history.length);
  const [nameInput, setNameInput] = useState(deviceName);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    dispatch(deviceNameSet(trimmed));
    await saveDeviceName(trimmed);
  };

  const handleClearHistory = () => {
    Alert.alert('Clear history', 'Remove all transfer history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => dispatch(historyCleared()) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topbar}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.sectionLabel}>This device</Text>
        <View style={styles.nameRow}>
          <TextInput style={styles.nameInput} value={nameInput} onChangeText={setNameInput} onBlur={handleSaveName} placeholder="Device name" />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>Download location</Text>
          <Text style={styles.rowValue}>{downloadPath}</Text>
        </View>

        <Text style={styles.sectionLabel}>Security</Text>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>Certificate fingerprint</Text>
          <Text style={styles.rowValueMono}>{certFingerprint}</Text>
        </View>

        <Text style={styles.sectionLabel}>Data</Text>
        <Pressable style={styles.row} onPress={handleClearHistory}>
          <Text style={styles.rowTitle}>Clear transfer history</Text>
          <Text style={styles.rowValue}>{historyCount} records</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  topbar: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14 },
  title: { fontFamily: 'Poppins-SemiBold', fontSize: 19, color: colors.ink },
  content: { paddingHorizontal: 18 },
  sectionLabel: { fontFamily: 'OpenSans-SemiBold', fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 18, marginBottom: 10 },
  nameRow: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: 8 },
  nameInput: { fontFamily: 'OpenSans-SemiBold', fontSize: 13.5, color: colors.ink, padding: 13 },
  row: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 13, marginBottom: 8 },
  rowTitle: { fontFamily: 'OpenSans-SemiBold', fontSize: 13.5, color: colors.ink },
  rowValue: { fontFamily: 'OpenSans-Regular', fontSize: 11.5, color: colors.muted, marginTop: 2 },
  rowValueMono: { fontFamily: 'JetBrainsMono-Regular', fontSize: 10.5, color: colors.muted, marginTop: 2 },
});