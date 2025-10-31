import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import useAuth from '@/hooks/useAuth';
export default function ButtonLogout() {
  const { logout } = useAuth();
  return (
    <Button
      type="text"
      color="danger"
      variant="dashed"
      icon={<LogoutOutlined />}
      onClick={() => logout()}
    >
      Đăng xuất
    </Button>
  );
}
