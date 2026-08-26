import { configureStore } from "@reduxjs/toolkit";
import discoveryReducer from '../features/discovery/discoverySlice';

export const store = configureStore({
    reducer: {
        discovery: discoveryReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;