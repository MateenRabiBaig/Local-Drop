import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { ReceiveWaitScreen } from "../screens/ReceiveWaitScreen";
import { FilePickerScreen } from "../screens/FilePickerScreen";

const Stack = createNativeStackNavigator();

export function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Receive" component={ReceiveWaitScreen} />
                <Stack.Screen name="Send" component={FilePickerScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
