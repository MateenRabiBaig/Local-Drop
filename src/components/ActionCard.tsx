import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { Icon } from './Icon';

interface Props {
    variant: 'send' | 'receive';
    title: string;
    description: string;
    onPress: () => void;
}

export function ActionCard({ variant, title, description, onPress }: Props) {
    const iconBg = variant === 'send' ? colors.signalDim : colors.amberDim;
    const iconFg = variant === 'send' ? colors.signal : colors.amber;

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={[styles.icon, { backgroundColor: iconBg }]}><Icon name={variant} color={iconFg} size={21} /></View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.desc}>{description}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
        borderRadius: 10, paddingVertical: 19, paddingHorizontal: 14, alignItems: 'center', gap: 9
    },
    icon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
    title: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: colors.ink },
    desc: { fontFamily: 'OpenSans-Regular', fontSize: 10.5, color: colors.muted, textAlign: 'center' }
});
