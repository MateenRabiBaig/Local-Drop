import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../theme/colors";
import { ActionCard } from "../components/ActionCard";
import { DeviceCard } from "../components/DeviceCard";
import type { RootState } from "../app/store";
import { zeroconfService } from "../features/discovery/zeroconfService";
import { deviceFound, deviceLost } from "../features/discovery/discoverySlice";
import { requestDiscoveryPermissions } from "../features/discovery/permissions";
import { Icon } from '../components/Icon';
import { BottomTabs } from '../components/BottomTabs';

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
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <View style={styles.topBar}>
                <Text style={styles.title}>LocalDrop</Text>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <View style={styles.wifiChip}>
                    <Icon name="wifi" size={16} color={colors.success} />
                    <Text style={styles.wifiText}>Connected to Wi-Fi</Text>
                </View>

                <Text style={styles.introTitle}>Share files nearby</Text>
                <Text style={styles.introBody}>Fast, private transfers over your local network.</Text>

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
            <BottomTabs />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.paper },
    topBar: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 },
    title: { fontFamily: 'Poppins-SemiBold', fontSize: 21, color: colors.ink },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 20, paddingBottom: 28 },
    wifiChip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.successDim, borderRadius: 7, paddingVertical: 7, paddingHorizontal: 10, marginBottom: 22, alignSelf: 'flex-start' },
    wifiText: { fontFamily: 'OpenSans-SemiBold', fontSize: 11.5, color: colors.success },
    introTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 19, color: colors.ink, marginBottom: 3 },
    introBody: { fontFamily: 'OpenSans-Regular', fontSize: 13, color: colors.muted, marginBottom: 17 },
    actionGrid: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    sectionLabel: {
        fontFamily: 'OpenSans-SemiBold', fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 18, marginBottom: 10,
    }
});
