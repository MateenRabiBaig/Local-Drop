import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  deviceName: string;
  certFingerprint: string;
  downloadPath: string;
}

const initialState: SettingsState = {
  deviceName: 'My Phone',
  certFingerprint: 'BE:7F:ED:CD:B3:00:3A:14:E4:8A:3C:A6:9A:CB:3C:4F:1B:5D:10:1C:39:E8:1C:54:85:EE:AB:00:0F:CD:6D:3D',
  downloadPath: 'App storage',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    deviceNameSet(state, action: PayloadAction<string>) {
      state.deviceName = action.payload;
    },
    settingsLoaded(state, action: PayloadAction<Partial<SettingsState>>) {
      Object.assign(state, action.payload);
    },
  },
});

export const { deviceNameSet, settingsLoaded } = settingsSlice.actions;
export default settingsSlice.reducer;