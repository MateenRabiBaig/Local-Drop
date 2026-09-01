import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

interface Props {
    fileName: string;
    peerName: string;
    direction: 'sent' | 'receive';
    onDone: () => void;
}

export function TransferCompleteScreen({ fileName, peerName, direction, onDone }: Props) {
    return (
        <View style={styles.wrap}>
            <View style={styles.icon}>
                <Text style={styles.checkmark}>{'\u2173'}</Text>
            </View>
            <Text style={styles.title}>{direction === 'sent' ? 'Sent Successfully' : 'Received Successfully' }</Text>
            <Text>{fileName} was {direction === 'sent' ? `sent to ${peerName}` : `received from ${peerName}` }</Text>
            <Pressable style={styles.doneBtn} onPress={onDone}>
                <Text style={styles.doneText}>Done</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    icon: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.successDim, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
    checkmark: { fontSize: 34, color: colors.success },
    title: { fontFamily: 'Poppins-SemiBold', fontSize: 18, color: colors.ink, marginBottom: 6 },
    body: { fontFamily: 'OpenSans-Regular', fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: 28 },
    doneBtn: { backgroundColor: colors.signal, paddingVertical: 13, paddingHorizontal: 40, borderRadius: 12 },
    doneText: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#fff' }
})