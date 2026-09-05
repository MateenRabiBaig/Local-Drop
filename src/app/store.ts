import { configureStore } from "@reduxjs/toolkit";
import discoveryReducer from '../features/discovery/discoverySlice';
import transferReducer from '../features/transfer/transferSlice';
import settingsReducer from '../features/settings/settingsSlice';

export const store = configureStore({
    reducer: {
        discovery: discoveryReducer,
        transfer: transferReducer,
        settings: settingsReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;