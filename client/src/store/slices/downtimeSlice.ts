import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import type { DowntimeLog } from '../../types.js';

interface DowntimeState {
  logs: DowntimeLog[];
  loading: boolean;
  error: string | null;
}

interface DowntimeFilters {
  machine_id?: string;
  date?: string;
}

const initialState: DowntimeState = {
  logs: [],
  loading: false,
  error: null,
};

export const fetchDowntime = createAsyncThunk<DowntimeLog[], DowntimeFilters | undefined, { rejectValue: string }>(
  'downtime/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params: Record<string, string> = {};
      if (filters.machine_id) params.machine_id = filters.machine_id;
      if (filters.date) params.date = filters.date;
      const { data } = await api.get<DowntimeLog[]>('/api/downtime', { params });
      return data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      return rejectWithValue(msg ?? 'Failed to fetch downtime logs');
    }
  }
);

export const createDowntime = createAsyncThunk<DowntimeLog, Partial<DowntimeLog>, { rejectValue: string }>(
  'downtime/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<DowntimeLog>('/api/downtime', payload);
      return data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      return rejectWithValue(msg ?? 'Failed to create downtime log');
    }
  }
);

const downtimeSlice = createSlice({
  name: 'downtime',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDowntime.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDowntime.fulfilled, (state, action: PayloadAction<DowntimeLog[]>) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchDowntime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(createDowntime.fulfilled, (state, action: PayloadAction<DowntimeLog>) => {
        state.logs = [action.payload, ...state.logs];
      });
  },
});

export default downtimeSlice.reducer;
