import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

interface Props {
    variant: 'send' | 'receive';
    title: string;
    description: string;
    onPress: () => void;
}

export function ActionCard({ variant, title, description, onPress }: Props) {
    const iconBg = variant === 'send' ? colors.signalDim : colors.amberDim;
    const iconFg = variant === 'send' ? colors.signal : '#B9760E';
    const glyph = variant === 'send' ? '\u2191' : '\u2193';

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={[styles.icon, { backgroundColor: iconBg }]}>
                <Text style={[styles.glyph, {color: iconFg}]}>{glyph}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.desc}>{description}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
        borderRadius: 18, paddingVertical: 22, paddingHorizontal: 14, alignItems: 'center', gap: 10
    },
    icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
    glyph: { fontSize: 22 },
    title: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: colors.ink },
    desc: { fontFamily: 'OpenSans-Regular', fontSize: 10.5, color: colors.muted, textAlign: 'center' }
});