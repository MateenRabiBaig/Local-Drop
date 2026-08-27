import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Transfer } from "../../types";

interface TransferState {
    active: Transfer | null;
    history: Transfer[];
}

const initialState: TransferState = {
    active: null,
    history: [],
}

const transferSlice = createSlice({
    name: 'transfer',
    initialState,
    reducers: {
        transferStarted(state, action: PayloadAction<Transfer>) {
            state.active = action.payload;
        },
        transferProgressed(state, action: PayloadAction<{ bytesTransferred: number }>) {
            if(state.active) {
                state.active.bytesTransferred = action.payload.bytesTransferred;
                state.active.status = 'in-progress';
            }
        },
        transferFinished(state, action: PayloadAction<{ status: 'completed' | 'failed' | 'cancelled' }>) {
            if(state.active) {
                state.active.status = action.payload.status;
                state.active.completedAt = Date.now();
                state.history.unshift(state.active);
                state.active = null;
            }
        }
    }
});

export const { transferStarted, transferProgressed, transferFinished } = transferSlice.actions;
export default transferSlice.reducer;