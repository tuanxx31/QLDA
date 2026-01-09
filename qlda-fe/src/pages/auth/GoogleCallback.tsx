import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { App } from 'antd';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const { login, logout } = useAuth();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    
    if (hasProcessed.current) {
      return;
    }

    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        hasProcessed.current = true;
        const user = JSON.parse(decodeURIComponent(userParam));
        logout();
        login(token, user);
        message.success('Đăng nhập bằng Google thành công!');
        navigate('/dashboard', { replace: true });
      } catch {
        hasProcessed.current = true;
        message.error('Đăng nhập thất bại. Vui lòng thử lại!');
        navigate('/login', { replace: true });
      }
    } else {
      hasProcessed.current = true;
      message.error('Đăng nhập thất bại. Vui lòng thử lại!');
      navigate('/login', { replace: true });
    }
  }, [searchParams, login, logout, message, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>Đang xử lý đăng nhập...</div>
    </div>
  );
}

