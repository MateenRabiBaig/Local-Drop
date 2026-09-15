import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { ReceiveWaitScreen } from "../screens/ReceiveWaitScreen";
import { SendScanScreen } from "../screens/SendScanScreen";
import { FilePickerScreen } from "../screens/FilePickerScreen";
import { HistoryScreen } from "../screens/HistoryScreens";
import { SettingsScreen } from "../screens/SettingsScreen";

const Stack = createNativeStackNavigator();

export function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ReceiveWait" component={ReceiveWaitScreen} />
                <Stack.Screen name="SendScan" component={SendScanScreen} />
                <Stack.Screen name="FilePicker" component={FilePickerScreen} />
                <Stack.Screen name="History" component={HistoryScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
