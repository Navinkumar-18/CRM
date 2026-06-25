import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import api from '../../api/axios';

export const ProtectedRoute = () => {
  const { isAuthenticated, setUser, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      try {
        if (!isAuthenticated) {
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

  return <Outlet />;
};
