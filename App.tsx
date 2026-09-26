import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from './src/app/store';
import { RootNavigator } from "./src/navigation/RootNavigator";
import { loadDeviceName } from "./src/features/settings/settingsStorage";
import { deviceNameSet } from "./src/features/settings/settingsSlice";
import { SafeAreaProvider } from 'react-native-safe-area-context';

function Bootstrap() {
  const dispatch = useDispatch();
  useEffect(() => {
    loadDeviceName().then(name => {
      if(name) dispatch(deviceNameSet(name));
    });
  }, [dispatch]);
  return <SafeAreaProvider><RootNavigator /></SafeAreaProvider>;
}

export default function App() {
  return (
    <Provider store={store}>
      <Bootstrap />
    </Provider>
  )
}
