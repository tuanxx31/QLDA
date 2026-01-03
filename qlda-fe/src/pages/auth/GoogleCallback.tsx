import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { App } from 'antd';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const { login, logout } = useAuth();
  const { message } = App.useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        logout();
        login(token, user);
        message.success('Đăng nhập bằng Google thành công!');
        navigate('/dashboard', { replace: true });
      } catch (error) {
        message.error('Đăng nhập thất bại. Vui lòng thử lại!');
        navigate('/login', { replace: true });
      }
    } else {
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

