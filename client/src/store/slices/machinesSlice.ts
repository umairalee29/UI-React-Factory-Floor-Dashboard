import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import type { Machine, OeeTrendPoint } from '../../types.js';

interface MachinesState {
  list: Machine[];
  oeeTrend: OeeTrendPoint[];
  loading: boolean;
  error: string | null;
}

const initialState: MachinesState = {
  list: [],
  oeeTrend: [],
  loading: false,
  error: null,
};

const MAX_TREND_POINTS = 20;

function buildTrendPoint(machines: Machine[]): OeeTrendPoint {
  const avg =
    machines.reduce((sum, m) => sum + (m.oee_score || 0), 0) / (machines.length || 1);
  const now = new Date();
  return {
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    oee: Math.round(avg * 10) / 10,
    machines: machines.map((m) => ({ name: m.name, status: m.status, oee: m.oee_score })),
  };
}

export const fetchMachines = createAsyncThunk<Machine[], void, { rejectValue: string }>(
  'machines/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Machine[]>('/api/machines');
      return data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      return rejectWithValue(msg ?? 'Failed to fetch machines');
    }
  }
);

const machinesSlice = createSlice({
  name: 'machines',
  initialState,
  reducers: {
    updateMachinesFromSocket(state, action: PayloadAction<Machine[]>) {
      state.list = action.payload;
      state.oeeTrend = [
        ...state.oeeTrend.slice(-(MAX_TREND_POINTS - 1)),
        buildTrendPoint(action.payload),
      ];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMachines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachines.fulfilled, (state, action: PayloadAction<Machine[]>) => {
        state.loading = false;
        state.list = action.payload;
        state.oeeTrend = [buildTrendPoint(action.payload)];
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { updateMachinesFromSocket } = machinesSlice.actions;
export default machinesSlice.reducer;
