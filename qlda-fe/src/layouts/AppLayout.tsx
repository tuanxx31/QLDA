import { ProLayout } from '@ant-design/pro-components';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, Space, type MenuProps } from 'antd';
import useAuth from '@/hooks/useAuth';
export default function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { authUser: user } = useAuth();

  const menuItems: MenuProps['items'] = [
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        logout();
      },
    },
  ];

  return (
    <ProLayout
      title="Quản lý dự án "
      layout="mix"
      menuItemRender={(item, dom) => (
        <div onClick={() => item.path && navigate(item.path)}>{dom}</div>
      )}
      route={{
        routes: [
          {
            path: '/dashboard',
            name: 'Bảng điều khiển',
            icon: <DashboardOutlined />,
          },
          { path: '/groups', name: 'Nhóm', icon: <TeamOutlined /> },
          { path: '/projects', name: 'Dự án', icon: <ProjectOutlined /> },
        ],
      }}
      rightContentRender={() => (
        <Dropdown menu={{ items: menuItems as MenuProps['items'] }} placement="bottomRight">
          <Space style={{ cursor: 'pointer', paddingRight: 16 }} direction="horizontal">
            <span>{user.name}</span>
            <Avatar src={user.avatar} size="small" />
          </Space>
        </Dropdown>
      )}
    >
          <Outlet />
    </ProLayout>
  );
}
