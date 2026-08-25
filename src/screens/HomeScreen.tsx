import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../theme/colors";
import { ActionCard } from "../components/ActionCard";
import { DeviceCard } from "../components/DeviceCard";
import type { RootState } from "../app/store";
import { zeroconfService } from "../features/discovery/zeroconfService";
import { deviceFound, deviceLost } from "../features/discovery/discoverySlice";
import { requestDiscoveryPermissions } from "../features/discovery/permissions";

export function HomeScreen() {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const devices = useSelector((s: RootState) => s.discovery.devices);

    useEffect(() => {
        const offFound = zeroconfService.onDeviceFound(device => { dispatch(deviceFound(device)); });
        const offLost = zeroconfService.onDeviceLost(id => { dispatch(deviceLost({ id })); });
        requestDiscoveryPermissions();

        return () => {
            offFound();
            offLost();
        };
    }, [dispatch]);

    return (
        <View style={styles.screen}>
            <View style={styles.topBar}>
                <Text style={styles.title}>LocalDrop</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.wifiChip}>
                    <Text style={styles.wifiText}>{'\u25C8'} Connected to Wi-Fi</Text>
                </View>

                <View style={styles.actionGrid}>
                    <ActionCard
                        variant="send"
                        title="Send"
                        description="Pick a file and choose a nearby device"
                        onPress={() => navigation.navigate('SendScan')}
                    />
                    <ActionCard
                        variant="receive"
                        title="Receive"
                        description="Wait for someone to send you a file"
                        onPress={() => navigation.navigate('ReceiveWait')}
                    />
                </View>
                {devices.length > 0 && (
                    <>
                        <Text style={styles.sectionLabel}>Recent Devices</Text>
                        {devices.map(d => (
                            <DeviceCard
                                key={d.id}
                                device={d}
                                onPress={dev => navigation.navigate('FilePicker', { device: dev })}
                            />
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.paper },
    topBar: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14 },
    title: { fontFamily: 'Poppins-SemiBold', fontSize: 19, color: colors.ink },
    content: { paddingHorizontal: 18, paddingBottom: 24 },
    wifiChip: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 16, alignSelf: 'flex-start' },
    wifiText: { fontFamily: 'JetBrainsMono-Regular', fontSize: 12, color: colors.muted },
    actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 6 },
    sectionLabel: {
        fontFamily: 'OpenSans-SemiBold', fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 18, marginBottom: 10,
    }
});