import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App, Spin, Avatar, Upload, Space } from 'antd';
import { UserOutlined, LoadingOutlined, CameraOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import {
  ProForm,
  ProFormText,
  ProCard,
  ProFormDatePicker,
  ProFormSelect,
} from '@ant-design/pro-components';
import { getUserProfile, updateUserProfile, uploadAvatar } from '@/services/user.services';
import type { UpdateUserDto } from '@/types/user.type';
import { getAvatarUrl } from '@/utils/avatarUtils';
import useAuth from '@/hooks/useAuth';

const ProfileSettings = () => {
  const { message } = App.useApp();
  const { updateAuthUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
  });

  const { mutateAsync: updateProfile, isPending } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: async () => {
      message.success('Cập nhật thông tin thành công!');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      // Fetch updated user and update auth state
      const updatedUser = await getUserProfile();
      updateAuthUser(updatedUser);
    },
    onError: () => message.error('Cập nhật thất bại, vui lòng thử lại.'),
  });

  const { mutateAsync: uploadAvatarFile, isPending: isUploadingAvatar } = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: async () => {
      message.success('Cập nhật avatar thành công!');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      // Fetch updated user and update auth state
      const updatedUser = await getUserProfile();
      updateAuthUser(updatedUser);
    },
    onError: () => message.error('Cập nhật avatar thất bại, vui lòng thử lại.'),
  });

  const handleAvatarUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const fileObj = file as File;
      const isValidType = /\.(jpg|jpeg|png|webp)$/i.test(fileObj.name);
      const isValidSize = fileObj.size <= 5 * 1024 * 1024;

      if (!isValidType) {
        message.error('Chỉ chấp nhận file ảnh: jpg, png, webp');
        onError?.(new Error('Invalid file type'));
        return;
      }

      if (!isValidSize) {
        message.error('File không được vượt quá 5MB');
        onError?.(new Error('File too large'));
        return;
      }

      await uploadAvatarFile(fileObj);
      onSuccess?.(null);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  if (isLoading) return <Spin />;

  if (!user) return <div>Không tìm thấy thông tin cá nhân</div>;

  return (
    <ProCard title="Cập nhật thông tin cá nhân" bordered>
      <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 24 }}>
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <Avatar
            size={120}
            src={getAvatarUrl(user.avatar)}
            icon={<UserOutlined />}
            style={{ marginBottom: 8 }}
          />
          <Upload
            customRequest={handleAvatarUpload}
            showUploadList={false}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            disabled={isUploadingAvatar}
          >
            <Space>
              {isUploadingAvatar ? (
                <LoadingOutlined />
              ) : (
                <CameraOutlined />
              )}
              <span>{isUploadingAvatar ? 'Đang tải lên...' : 'Thay đổi avatar'}</span>
            </Space>
          </Upload>
        </Space>
      </Space>
      <ProForm<UpdateUserDto>
        initialValues={user}
        onFinish={async values => {
          await updateProfile(values);
        }}
        submitter={{
          searchConfig: { submitText: 'Lưu thay đổi' },
          resetButtonProps: false,
        }}
        loading={isPending}
      >
        <ProFormText
          name="name"
          label="Họ và tên"
          placeholder="Nhập họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
        />

        <ProFormText name="email" label="Email" disabled tooltip="Không thể thay đổi email" />

        <ProFormDatePicker
          name="dateOfBirth"
          label="Ngày sinh"
          placeholder="Chọn ngày sinh"
          fieldProps={{
            format: 'DD-MM-YYYY',
            valueFormat: 'YYYY-MM-DD',
          }}
        />
        <ProFormSelect
          name="gender"
          label="Giới tính"
          placeholder="Chọn giới tính"
          options={[
            { label: 'Nam', value: 'male' },
            { label: 'Nữ', value: 'female' },
            { label: 'Khác', value: 'other' },
          ]}
        />
        <ProFormText name="studentCode" label="Mã sinh viên" placeholder="Nhập mã sinh viên" />
        <ProFormText name="department" label="Khoa" placeholder="Nhập tên khoa" />
      </ProForm>
    </ProCard>
  );
};

export default ProfileSettings;
