import { LoginFormPage, ProFormText } from '@ant-design/pro-components';
import useAuth from '@/hooks/useAuth';
import type { LoginParams } from '@/services/auth.services';
import { login as loginService, getGoogleAuthUrl } from '@/services/auth.services';
import { Link, useNavigate } from 'react-router-dom';
import { App, Button } from 'antd';
import { useState } from 'react';

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, logout } = useAuth();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const handleSubmit = async (values: LoginParams) => {
    setIsSubmitting(true);
    try {
      const res = await loginService(values);
      logout();
      
      login(res.access_token, res.user);
      message.success('Đăng nhập thành công!');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Sai tài khoản hoặc mật khẩu!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginFormPage
      title="Hệ thống quản lý dự án sinh viên 🎓"
      subTitle="Đăng nhập để bắt đầu"
      onFinish={handleSubmit}
      loading={isSubmitting}
    >
      <ProFormText
        name="email"
        label="Email"
        placeholder="Nhập email"
        rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!'   }]}
      />

      <ProFormText.Password
        name="password"
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Link to="/register">Chưa có tài khoản? Đăng ký</Link>
        <Link to="/forgot-password">Quên mật khẩu?</Link>
      </div>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <div style={{ marginBottom: 12, color: '#8c8c8c' }}>Hoặc</div>
        <Button
          type="default"
          block
          size="large"
          onClick={() => {
            window.location.href = getGoogleAuthUrl();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <path
                d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.965-2.18l-2.908-2.258c-.806.54-1.837.86-3.057.86-2.35 0-4.34-1.587-5.053-3.72H.957v2.332C2.438 15.983 5.482 18 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.947 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l2.99-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.947 7.29C4.66 5.157 6.65 3.58 9 3.58z"
                fill="#EA4335"
              />
            </g>
          </svg>
          Đăng nhập bằng Google
        </Button>
      </div>
    </LoginFormPage>
  );
}
