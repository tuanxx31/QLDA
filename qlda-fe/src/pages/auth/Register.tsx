import { LoginFormPage, ProFormText } from '@ant-design/pro-components';
import { App } from 'antd';
import { api } from '@/services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Register() {
  const { message } = App.useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/register', values);
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginFormPage
      title="Tạo tài khoản mới"
      subTitle="Dành cho sinh viên mới"
      onFinish={handleSubmit}
      submitter={{ searchConfig: { submitText: 'Đăng ký' } }}
      loading={isSubmitting}
    >
      <ProFormText
        name="name"
        label="Họ tên"
        placeholder="Nguyễn Văn A"
        rules={[
          { required: true, message: 'Vui lòng nhập họ tên!' },
          { min: 3, message: 'Họ tên phải có ít nhất 3 ký tự!' },
        ]}
      />

      <ProFormText
        name="email"
        label="Email"
        placeholder="abc@student.edu.vn"
        rules={[
          { required: true, message: 'Vui lòng nhập email!' },
          {
            type: 'email',
            message: 'Email không hợp lệ!',
          },
          
          
          
          
        ]}
      />

      <ProFormText.Password
        name="password"
        label="Mật khẩu"
        placeholder="Tối thiểu 6 ký tự"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu!' },
          { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
          
          
          
          
        ]}
      />

      <ProFormText.Password
        name="confirmPassword"
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Mật khẩu không khớp!'));
            },
          }),
        ]}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
      </div>
    </LoginFormPage>
  );
}
