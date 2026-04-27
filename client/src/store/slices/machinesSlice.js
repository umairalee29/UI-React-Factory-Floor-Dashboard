import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchMachines = createAsyncThunk(
  'machines/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/machines');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch machines');
    }
  }
);

const MAX_TREND_POINTS = 20;

const machinesSlice = createSlice({
  name: 'machines',
  initialState: {
    list: [],
    oeeTrend: [], // [{ time: '14:05', oee: 87.3 }, ...]
    loading: false,
    error: null,
  },
  reducers: {
    updateMachinesFromSocket(state, action) {
      state.list = action.payload;

      // Append a new OEE trend data point
      const avg =
        action.payload.reduce((sum, m) => sum + (m.oee_score || 0), 0) /
        (action.payload.length || 1);

      const now = new Date();
      const timeLabel = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      state.oeeTrend = [
        ...state.oeeTrend.slice(-(MAX_TREND_POINTS - 1)),
        { time: timeLabel, oee: Math.round(avg * 10) / 10 },
      ];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMachines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;

        // Seed the trend with the initial fetch
        const avg =
          action.payload.reduce((sum, m) => sum + (m.oee_score || 0), 0) /
          (action.payload.length || 1);
        const now = new Date();
        const timeLabel = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        state.oeeTrend = [{ time: timeLabel, oee: Math.round(avg * 10) / 10 }];
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateMachinesFromSocket } = machinesSlice.actions;
export default machinesSlice.reducer;
