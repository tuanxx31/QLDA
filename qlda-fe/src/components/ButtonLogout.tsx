import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import useAuth from "@/hooks/useAuth";
export default function ButtonLogout() {
  const { logout } = useAuth();
  return (
    <Button
      type="text"
      icon={<LogoutOutlined />}
      onClick={() => logout()}
      style={{ color: "#555" }}
    >
      Đăng xuất
    </Button>
  );
}
