import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

interface Props {
    fileName: string;
    peerName: string;
    direction: 'sent' | 'received';
    savedPath?: string | null;
    onSave?: () => void;
    onDone: () => void;
}

export function TransferCompleteView({ fileName, peerName, direction, savedPath, onSave, onDone }: Props) {
    return (
        <View style={styles.wrap}>
            <View style={styles.icon}>
            <Text style={styles.checkmark}>{'\u2713'}</Text>
            </View>
            <Text style={styles.title}>{direction === 'sent' ? 'Sent Successfully' : 'Received Successfully' }</Text>
            <Text style={styles.body}>{fileName} was {direction === 'sent' ? `sent to ${peerName}` : `received from ${peerName}` }</Text>
            {direction === 'received' && savedPath && onSave && (
                <Pressable style={styles.saveBtn} onPress={onSave}>
                    <Text style={styles.saveText}>Save to Files / Downloads</Text>
                </Pressable>
            )}
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
    saveBtn: { borderWidth: 1, borderColor: colors.signal, paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12, marginBottom: 12 },
    saveText: { fontFamily: 'Poppins-SemiBold', fontSize: 13, color: colors.signal },
    doneBtn: { backgroundColor: colors.signal, paddingVertical: 13, paddingHorizontal: 40, borderRadius: 12 },
    doneText: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#fff' }
})
