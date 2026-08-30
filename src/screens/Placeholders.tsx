import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

function Placeholder({ label }: { label: string }) {
    return (
        <View>
            <Text></Text>
            <Text></Text>
        </View>
    )
}

export const TransferProgressScreen = () => <Placeholder label="Transfer Progress" />;
export const TransferCompleteScreen = () => <Placeholder label="History" />
export const HistoryScreen = () => <Placeholder label="History" />
export const SettingsScreen = () => <Placeholder label="Settings" />

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
    text: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.ink, marginBottom: 6 },
    sub: { fontFamily: 'OpenSans-Regular', fontSize: 12.5, color: colors.muted }
});