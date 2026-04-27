import { useSelector, useDispatch } from 'react-redux';
import { loginThunk, logout, clearError } from '../store/slices/authSlice.js';

export default function useAuth() {
  const dispatch = useDispatch();
  const { token, user, loading, error } = useSelector((s) => s.auth);

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated: Boolean(token),
    login: (credentials) => dispatch(loginThunk(credentials)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
}
