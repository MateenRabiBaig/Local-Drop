import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import type { RootState } from '../app/store';

const iconStyle = {
  sent: { bg: colors.signalDim, fg: colors.signal, glyph: '\u2191' },
  received: { bg: colors.successDim, fg: colors.success, glyph: '\u2193' },
  failed: { bg: colors.dangerDim, fg: colors.danger, glyph: '\u2715' },
};

export function HistoryScreen() {
  const history = useSelector((s: RootState) => s.transfer.history);

  return (
    <View style={styles.screen}>
      <View style={styles.topbar}>
        <Text style={styles.title}>History</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.content}
        data={history}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No transfers yet</Text>}
        renderItem={({ item }) => {
          const kind = item.status === 'failed' ? 'failed' : item.direction === 'sent' ? 'sent' : 'received';
          const icon = iconStyle[kind];
          return (
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: icon.bg }]}>
                <Text style={{ color: icon.fg, fontSize: 16 }}>{icon.glyph}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{item.fileName}</Text>
                <Text style={styles.rowMeta}>
                  {item.direction === 'sent' ? `To ${item.deviceName}` : `From ${item.deviceName}`} ·{' '}
                  {(item.fileSizeBytes / 1024).toFixed(1)} KB
                </Text>
              </View>
              <Text style={[ styles.badge, { color: item.status === 'failed' ? colors.danger : colors.success } ]}>
                {item.status === 'failed' ? 'Failed' : item.direction === 'sent' ? 'Sent' : 'Received'}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  topbar: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14 },
  title: { fontFamily: 'Poppins-SemiBold', fontSize: 19, color: colors.ink },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  empty: { fontFamily: 'OpenSans-Regular', fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowName: { fontFamily: 'OpenSans-SemiBold', fontSize: 13, color: colors.ink },
  rowMeta: { fontFamily: 'OpenSans-Regular', fontSize: 11, color: colors.muted, marginTop: 1 },
  badge: { fontFamily: 'OpenSans-SemiBold', fontSize: 10.5 },
});