import useAuth from '@/hooks/useAuth';
import { deleteUser } from '@/services/user.services';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, Popconfirm, Typography, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Text, Paragraph, Title } = Typography;

export default function SecuritySettings() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <DeleteAccount />
    </div>
  );
}

const DeleteAccount = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleDeleteAccount = async () => {
    try {
      await deleteUser();
      logout();
      message.success('Xóa tài khoản thành công');
      navigate('/login');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xóa tài khoản thất bại');
    }
  };

  return (
    <ProCard
      title={<Title level={4}>Xóa tài khoản</Title>}
      extra={
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa tài khoản này?"
          description="Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn."
          okText="Xác nhận xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={handleDeleteAccount}
          icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
        >
          <Button type="primary" danger>
            Xóa tài khoản
          </Button>
        </Popconfirm>
      }
      headerBordered
      style={{ borderRadius: 12 }}
    >
      <Space direction="vertical" size="small">
        <Paragraph>Việc xóa tài khoản của bạn sẽ:</Paragraph>
        <ul style={{ marginLeft: 24 }}>
          <li>
            <Text type="danger">Xóa toàn bộ dữ liệu cá nhân</Text> bao gồm hồ sơ, nhóm và dự án bạn
            đã tham gia.
          </li>
          <li>
            <Text type="danger">Không thể khôi phục lại</Text> tài khoản sau khi xóa.
          </li>
        </ul>
      </Space>
    </ProCard>
  );
};
