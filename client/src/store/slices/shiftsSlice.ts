import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import type { ShiftSummary } from '../../types.js';

interface ShiftsState {
  summaries: ShiftSummary[];
  loading: boolean;
  error: string | null;
}

const initialState: ShiftsState = {
  summaries: [],
  loading: false,
  error: null,
};

export const fetchShifts = createAsyncThunk<ShiftSummary[], void, { rejectValue: string }>(
  'shifts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ShiftSummary[]>('/api/shifts');
      return data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      return rejectWithValue(msg ?? 'Failed to fetch shift summaries');
    }
  }
);

const shiftsSlice = createSlice({
  name: 'shifts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action: PayloadAction<ShiftSummary[]>) => {
        state.loading = false;
        state.summaries = action.payload;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export default shiftsSlice.reducer;
