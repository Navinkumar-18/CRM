import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user, setUser, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const validateToken = async () => {
      try {
        if (!isAuthenticated) {
          setIsChecking(false);
          return;
        }

        const now = Date.now();
        const lastValidatedTime = useAuthStore.getState().lastValidated;
        
        // Only re-validate if > 5 minutes have passed
        if (lastValidatedTime && now - lastValidatedTime < 5 * 60 * 1000) {
          setIsChecking(false);
          return;
        }

        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch {
        await logout();
      } finally {
        setIsChecking(false);
      }
    };

    validateToken();
  }, [isAuthenticated, setUser, logout]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8ff]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    if (location.pathname === '/leads') return <Navigate to="/my-leads" replace />;
    if (location.pathname === '/customers') return <Navigate to="/my-customers" replace />;
    if (location.pathname === '/tasks') return <Navigate to="/my-tasks" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
