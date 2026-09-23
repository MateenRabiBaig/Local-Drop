import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../theme/colors";
import { DeviceCard } from "../components/DeviceCard";
import { RootState } from '../app/store';
import { zeroconfService } from "../features/discovery/zeroconfService";
import { deviceFound, deviceLost, scanStarted, scanStopped } from "../features/discovery/discoverySlice";
import { requestDiscoveryPermissions } from "../features/discovery/permissions";

export function SendScanScreen() {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const devices = useSelector((s: RootState) => s.discovery.devices);
    const [manualHost, setManualHost] = useState('');

    const connectManually = () => {
        const host = manualHost.trim();
        if (!host) return;

        navigation.navigate('FilePicker', {
            device: {
                id: `manual-${host}`,
                name: `Device at ${host}`,
                host,
                port: 52999,
                lastSeen: Date.now(),
            },
        });
    };

    useFocusEffect(useCallback(() => {
        // Register listeners before starting the scan. Some Android devices
        // resolve an already-published service immediately.
        const offFound = zeroconfService.onDeviceFound(device => { dispatch(deviceFound(device)) });
        const offLost = zeroconfService.onDeviceLost(id => { dispatch(deviceLost({ id }) )});

        dispatch(scanStarted());
        let cancelled = false;
        requestDiscoveryPermissions().then(allowed => {
            if (!cancelled && allowed) zeroconfService.scan();
        });

        return () => {
            cancelled = true;
            zeroconfService.stopScan();
            dispatch(scanStopped());
            offFound();
            offLost();
        }
    }, [dispatch]));

    return (
        <View style={styles.screen}>
            <View style={styles.topbar}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backGlyph}>{'\u2190'}</Text>
                </Pressable>
                <Text style={styles.title}>Send a file</Text>
                <View style={{ width: 34 }}  />
            </View>

            <ScrollView contentContainerStyle={styles.hero}>
                <View style={styles.radarBig}>
                    <View style={styles.core}>
                        <Text style={styles.coreGlyph}></Text>
                    </View>
                </View>
                <Text style={styles.heroTitle}>Scanning for devices...</Text>
                <Text style={styles.heroSub}>Make sure other device is on same Wi-Fi with LocalDrop open</Text>

                {devices.length > 0 ? (
                    <View style={styles.foundList}>
                        <Text style={styles.foundLabel}>Found Nearby</Text>
                        {devices.map(d => (
                            <DeviceCard
                                key={d.id}
                                device={d}
                                onPress={dev => navigation.navigate('FilePicker', { device: dev })}
                            />
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyHint}>No devices found yet - still scanning</Text>
                )}

                <View style={styles.manualCard}>
                    <Text style={styles.manualTitle}>Can't see the device?</Text>
                    <Text style={styles.manualHint}>
                        Enter the receiver's Wi-Fi IPv4 address. The receiver must already be on the Receive screen.
                    </Text>
                    <View style={styles.manualRow}>
                        <TextInput
                            value={manualHost}
                            onChangeText={setManualHost}
                            placeholder="e.g. 192.168.1.24"
                            placeholderTextColor={colors.muted}
                            keyboardType="decimal-pad"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={styles.manualInput}
                        />
                        <Pressable style={styles.manualButton} onPress={connectManually}>
                            <Text style={styles.manualButtonText}>Connect</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.paper },
    topbar: { backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14 },
    backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    backGlyph: { fontSize: 16, color: colors.muted },
    title: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.ink },
    hero: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
    radarBig: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: colors.signal, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
    core: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.signalDim, alignItems: 'center', justifyContent: 'center' },
    coreGlyph: { fontSize: 24, color: colors.signal },
    heroTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.ink, textAlign: 'center', marginBottom: 4 },
    heroSub: { fontFamily: 'OpenSans-Regular', fontSize: 12.5, color: colors.muted, textAlign: 'center', marginBottom: 22 },
    foundList: { width: '100%' },
    foundLabel: { fontFamily: 'OpenSans-SemiBold', fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
    emptyHint: { fontFamily: 'OpenSans-Regular', fontSize: 12.5, color: colors.muted },
    manualCard: { width: '100%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginTop: 24 },
    manualTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: colors.ink, marginBottom: 4 },
    manualHint: { fontFamily: 'OpenSans-Regular', fontSize: 11.5, lineHeight: 17, color: colors.muted, marginBottom: 10 },
    manualRow: { flexDirection: 'row', gap: 8 },
    manualInput: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, fontFamily: 'JetBrainsMono-Regular', fontSize: 11.5, color: colors.ink },
    manualButton: { backgroundColor: colors.signal, borderRadius: 10, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' },
    manualButtonText: { fontFamily: 'Poppins-SemiBold', fontSize: 12, color: '#fff' },
})
