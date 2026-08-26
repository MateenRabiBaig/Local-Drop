import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../theme/colors";
import { DeviceCard } from "../components/DeviceCard";
import { RootState } from '../app/store';
import { zeroconfService } from "../features/discovery/zeroconfService";
import { deviceFound, deviceLost, scanStarted, scanStopped } from "../features/discovery/discoverySlice";

export function SendScanScreen() {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const devices = useSelector((s: RootState) => s.discovery.devices);

    useFocusEffect(useCallback(() => {
        dispatch(scanStarted());
        zeroconfService.scan();

        const offFound = zeroconfService.onDeviceFound(device => { dispatch(deviceFound(device)) });
        const offLost = zeroconfService.onDeviceLost(id => { dispatch(deviceLost({ id }) )});

        return () => {
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
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.paper },
    topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14 },
    backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    backGlyph: { fontSize: 16, color: colors.muted },
    title: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.ink },
    hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
    radarBig: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: colors.signal, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
    core: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.signalDim, alignItems: 'center', justifyContent: 'center' },
    coreGlyph: { fontSize: 24, color: colors.signal },
    heroTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.ink, textAlign: 'center', marginBottom: 4 },
    heroSub: { fontFamily: 'OpenSans-Regular', fontSize: 12.5, color: colors.muted, textAlign: 'center', marginBottom: 22 },
    foundList: { width: '100%' },
    foundLabel: { fontFamily: 'OpenSans-SemiBold', fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
    emptyHint: { fontFamily: 'OpenSans-Regular', fontSize: 12.5, color: colors.muted },
})