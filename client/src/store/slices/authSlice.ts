import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User, LoginCredentials, LoginResponse } from '../../types.js';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk<LoginResponse, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post<LoginResponse>(
        `${import.meta.env.VITE_API_URL || ''}/api/auth/login`,
        credentials
      );
      return data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error ?? 'Login failed');
      }
      return rejectWithValue('Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
