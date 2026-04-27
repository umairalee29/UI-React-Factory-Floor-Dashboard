import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import machinesReducer from './slices/machinesSlice.js';
import downtimeReducer from './slices/downtimeSlice.js';
import shiftsReducer from './slices/shiftsSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    machines: machinesReducer,
    downtime: downtimeReducer,
    shifts: shiftsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
