import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { colors } from "../theme/colors";
import { zeroconfService } from "../features/discovery/zeroconfService";
import { startReceiverServer, TRANSFER_PORT } from "../features/transfer/tcpTransferService";

export function ReceiveWaitScreen() {
    const navigation = useNavigation<any>();
    const [status, setStatus] = useState('Waiting to receive...');
    const [progress, setProgress] = useState<{ received: number; total: number } | null>(null);

    useFocusEffect(useCallback(() => {
        const instanceName = zeroconfService.publish("This Device", TRANSFER_PORT);
        const server = startReceiverServer({
            onProgress: (bytesReceived, fileSize) => {
                setStatus('Receiving...');
                setProgress({ received: bytesReceived, total: fileSize })
            },
            onComplete: (filePath, fileName) => {
                setStatus(`Received ${fileName}`);
            },
            onError: err => {
                setStatus(`Error: ${err.message}`);
            }
        });

        return () => {
            server.close();
            zeroconfService.unpublish(instanceName);
        };
    }, []));

    return (
        <View style={styles.screen}>
            <View style={styles.topbar}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backGlyph}>{'\u2190'}</Text>
                </Pressable>
                <Text style={styles.title}>Receive a file</Text>
                <View style={{ width: 34 }} />
            </View>
            <View style={styles.hero}>
                <Text style={styles.status}>{status}</Text>
                {progress && (
                    <Text style={styles.progress}>{Math.round((progress.received / progress.total) * 100)}% - {progress.received} / {progress.total} bytes</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.paper },
    topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14 },
    backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    backGlyph: { fontSize: 16, color: colors.muted },
    title: { fontFamily: 'Poppins-Semibold', fontSize: 16, color: colors.ink },
    hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    status: { fontFamily: 'Poppins-Semibold', fontSize: 16, color: colors.ink, marginBottom: 8 },
    progress: { fontFamily: 'JetBrainsMono-Regular', fontSize: 12.5, color: colors.muted }
});