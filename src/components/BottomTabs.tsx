import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Icon } from './Icon';

const tabs = [
  { route: 'Home', label: 'Home', icon: 'home' as const },
  { route: 'History', label: 'History', icon: 'history' as const },
  { route: 'Settings', label: 'Settings', icon: 'settings' as const },
];

export function BottomTabs() {
  const navigation = useNavigation<any>();
  const route = useRoute();

  return (
    <View style={styles.bar}>
      {tabs.map(tab => {
        const active = route.name === tab.route;
        return (
          <Pressable
            key={tab.route}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => navigation.navigate(tab.route)}
            style={styles.tab}
          >
            <Icon name={tab.icon} size={19} color={active ? colors.signal : colors.muted} />
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, paddingBottom: 6 },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 3 },
  label: { fontFamily: 'OpenSans-SemiBold', fontSize: 10.5, color: colors.muted },
  activeLabel: { color: colors.signal },
});
