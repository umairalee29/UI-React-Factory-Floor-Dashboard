import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchShifts = createAsyncThunk(
  'shifts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/shifts');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch shift summaries');
    }
  }
);

const shiftsSlice = createSlice({
  name: 'shifts',
  initialState: {
    summaries: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.summaries = action.payload;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default shiftsSlice.reducer;
