import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

export default function ProtectedRoute(): JSX.Element {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
