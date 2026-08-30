import { configureStore } from "@reduxjs/toolkit";
import discoveryReducer from '../features/discovery/discoverySlice';
import transferReducer from '../features/transfer/transferSlice';

export const store = configureStore({
    reducer: {
        discovery: discoveryReducer,
        transfer: transferReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;