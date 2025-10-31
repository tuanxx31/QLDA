import { Outlet, useNavigate } from 'react-router-dom';
import '@/styles/auth.css';
import useAuth from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function AuthLayout() {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/');
    }
  }, []);

  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
}
