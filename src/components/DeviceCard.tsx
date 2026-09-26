import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { Device } from "../types";
import { Icon } from './Icon';

interface Props {
    device: Device;
    variant?: 'blue' | 'purple';
    onPress: (device: Device) => void;
}

export function DeviceCard({ device, onPress }: Props) {
    const avatarBg = colors.signalDim;
    const avatarFg = colors.signal;

    return (
        <Pressable style={styles.card} onPress={() => onPress(device)}>
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                <Icon name="device" color={avatarFg} size={19} />
            </View>
            
            <View style={styles.info}>
                <Text style={styles.name}>{device.name}</Text>
                <View style={styles.metaRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.meta}>{device.host}</Text>
                </View>
            </View>
            <Text style={styles.chevron}>›</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
        borderRadius: 10, padding: 12, marginBottom: 8
    },
    avatar: { width: 40, height: 40, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    name: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: colors.ink },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success, marginRight: 5 },
    meta: { fontFamily: 'JetBrainsMono-Regular', fontSize: 11.5, color: colors.muted },
    chevron: { fontSize: 18, color: colors.border }
});
