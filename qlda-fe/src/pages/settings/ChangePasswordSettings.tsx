import { changePassword } from '@/services/user.services';
import type { ChangePasswordDto } from '@/types/user.type';
import { App } from 'antd';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChangePasswordSettings = () => {
  const { message } = App.useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: ChangePasswordDto) => {
    setIsSubmitting(true);
    try {
      await changePassword(values);
      message.success('Mật khẩu đã được cập nhật thành công');
      navigate('/settings');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật mật khẩu thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProForm<ChangePasswordDto> onFinish={handleSubmit} loading={isSubmitting}>
      <ProFormText.Password
        name="password"
        label="Mật khẩu hiện tại"
        placeholder="Nhập mật khẩu hiện tại"
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
      />

      <ProFormText.Password
        name="newPassword"
        label="Mật khẩu mới"
        placeholder="Tối thiểu 6 ký tự"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu mới' },
          { min: 6, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
        ]}
      />

      <ProFormText.Password
        name="confirmPassword"
        label="Xác nhận mật khẩu mới"
        placeholder="Nhập lại mật khẩu mới"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: 'Vui lòng xác nhận mật khẩu' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
            },
          }),
        ]}
      />
    </ProForm>
  );
};

export default ChangePasswordSettings;
