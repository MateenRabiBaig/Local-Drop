import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { Device } from "../types";

interface Props {
    device: Device;
    variant?: 'blue' | 'purple';
    onPress: (device: Device) => void;
}

export function DeviceCard({ device, variant='blue', onPress }: Props) {
    const avatarBg = variant === 'purple' ? colors.purpleDim : colors.signalDim;
    const avatarFg = variant === 'purple' ? colors.purple : colors.signal;

    return (
        <Pressable style={styles.card} onPress={() => onPress(device)}>
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                <Text style={[styles.avatarGlyph, { color: avatarFg }]}>{'\u25A4'}</Text>
            </View>
            
            <View style={styles.info}>
                <Text style={styles.name}>{device.name}</Text>
                <View style={styles.metaRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.meta}>{device.host}</Text>
                </View>
            </View>
            <Text style={styles.chevron}>{'\u203A'}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
        borderRadius: 14, padding: 13, marginBottom: 10
    },
    avatar: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    avatarGlyph: { fontSize: 18 },
    info: { flex: 1 },
    name: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: colors.ink },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success, marginRight: 5 },
    meta: { fontFamily: 'JetBrainsMono-Regular', fontSize: 11.5, color: colors.muted },
    chevron: { fontSize: 18, color: colors.border }
});