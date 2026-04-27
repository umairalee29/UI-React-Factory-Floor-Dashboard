import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchDowntime = createAsyncThunk(
  'downtime/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (filters.machine_id) params.machine_id = filters.machine_id;
      if (filters.date) params.date = filters.date;
      const { data } = await api.get('/api/downtime', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch downtime logs');
    }
  }
);

export const createDowntime = createAsyncThunk(
  'downtime/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/downtime', payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to create downtime log');
    }
  }
);

const downtimeSlice = createSlice({
  name: 'downtime',
  initialState: {
    logs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDowntime.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDowntime.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchDowntime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDowntime.fulfilled, (state, action) => {
        state.logs = [action.payload, ...state.logs];
      });
  },
});

export default downtimeSlice.reducer;
