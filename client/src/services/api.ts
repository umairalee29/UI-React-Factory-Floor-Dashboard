import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { Store } from '@reduxjs/toolkit';
import { logout } from '../store/slices/authSlice.js';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

let store: Store | null = null;

export function injectStore(_store: Store): void {
  store = _store;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = (store?.getState() as { auth?: { token?: string } })?.auth?.token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && store) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;
