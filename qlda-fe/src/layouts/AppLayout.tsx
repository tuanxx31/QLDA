import { PageContainer, ProLayout } from "@ant-design/pro-components";
import { Outlet, useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Space, type MenuProps } from "antd";
import useAuth from "@/hooks/useAuth";
export default function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  // Giả lập thông tin user (sau này có thể lấy từ API hoặc context)
  // const user = {
  //   name: "Nguyễn Văn A",
  //   avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=A",
  // };
  const { authUser: user } = useAuth();

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Hồ sơ cá nhân",
      icon: <UserOutlined />,
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      label: "Cài đặt",
      icon: <SettingOutlined />,
      onClick: () => navigate("/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        logout();
      },
    },
  ];

  return (
    <ProLayout
      title="QLDA Sinh viên"
      layout="mix"
      menuItemRender={(item, dom) => (
        <div onClick={() => item.path && navigate(item.path)}>{dom}</div>
      )}
      route={{
        routes: [
          {
            path: "/dashboard",
            name: "Bảng điều khiển",
            icon: <DashboardOutlined />,
          },
          { path: "/profile", name: "Hồ sơ cá nhân", icon: <UserOutlined /> },
        ],
      }}
      // ✅ Hiển thị avatar + tên người dùng bên phải header
      rightContentRender={() => (
        <Dropdown
          menu={{ items: menuItems as MenuProps["items"] }}
          placement="bottomRight"
        >
          <Space
            style={{ cursor: "pointer", paddingRight: 16 }}
            direction="horizontal"
          >
            <span>{user.name}</span>
            <Avatar src={user.avatar} size="small" />
          </Space>
        </Dropdown>
      )}
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </ProLayout>
  );
}
