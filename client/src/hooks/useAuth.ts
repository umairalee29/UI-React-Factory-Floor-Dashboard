import { useSelector, useDispatch } from 'react-redux';
import { loginThunk, logout, clearError } from '../store/slices/authSlice.js';
import type { RootState, AppDispatch } from '../store/index.js';
import type { User, LoginCredentials } from '../types.js';

interface UseAuthReturn {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => ReturnType<AppDispatch>;
  logout: () => void;
  clearError: () => void;
}

export default function useAuth(): UseAuthReturn {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user, loading, error } = useSelector((s: RootState) => s.auth);

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated: Boolean(token),
    login: (credentials: LoginCredentials) => dispatch(loginThunk(credentials)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
}
