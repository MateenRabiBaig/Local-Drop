import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Device } from '../../types';

interface DiscoveryState {
    devices: Device[];
    scanning: boolean;
}

const initialState: DiscoveryState = {
    devices: [],
    scanning: false
}

const discoverySlice = createSlice({
    name: 'discovery',
    initialState,
    reducers: {
        scanStarted(state): {
            state.scanning = true;
        },
        scanStopped(state) {
            state.scanning = false;
        },
        deviceFound(state, action: PayloadAction<Device>) {
            const existing = state.devices.findIndex(d => d.id === action.payload.id);
            if(existing >= 0) {
                state.devices[existing] = action.payload;
            }
            else {
                state.devices.push(action.payload)
            }
        },
        deviceLost(state, action: PayloadAction<{ id: string }>) {
            state.devices = state.devices.filter(d => d.id! == action.payload.id);
        },
        devicesCleared(state) {
            state.devices = [];
        },
    },
});

export const { scanStarted, scanStopped, deviceFound, deviceLost, devicesCleared } = discoverySlice.actions;
export default discoverySlice.reducer;