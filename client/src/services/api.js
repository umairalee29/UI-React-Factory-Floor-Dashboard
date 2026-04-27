import axios from 'axios';
import { logout } from '../store/slices/authSlice.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Injected after store creation to break circular dependency
let store;
export function injectStore(_store) {
  store = _store;
}

api.interceptors.request.use((config) => {
  const token = store?.getState()?.auth?.token;
  if (token) {
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
