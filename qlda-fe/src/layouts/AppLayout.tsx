import {
  DashboardOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import { Avatar, Dropdown, Space, theme, type MenuProps } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { logout, authUser: user } = useAuth();

  const menuItems: MenuProps['items'] = [
    {
      key: 'settings',
      label: 'Cài đặt tài khoản',
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => logout(),
    },
  ];

  const routes = {
    routes: [
      { path: '/dashboard', name: 'Bảng điều khiển', icon: <DashboardOutlined /> },
      { path: '/groups', name: 'Nhóm', icon: <TeamOutlined /> },
      { path: '/projects', name: 'Dự án', icon: <ProjectOutlined /> },
    ],
  };

  return (
    <div
      id="app-layout"
      style={{
        height: '100vh',
        overflow: 'auto',
      }}
    >
      <ProLayout
        title="Quản lý dự án"
        layout="mix"
        fixSiderbar
        // splitMenus
        location={{ pathname: location.pathname }}
        route={routes}
        menuItemRender={(item, dom) => (
          <div
            onClick={() => item.path && navigate(item.path)}
            style={{ cursor: 'pointer' }}
          >
            {dom}
          </div>
        )}
        breadcrumbRender={(routers = []) => [
          { path: '/dashboard', breadcrumbName: 'Trang chủ' },
          ...routers,
        ]}
        breadcrumbProps={{
          itemRender: (route, _params, routes) => {
            const last = routes.indexOf(route) === routes.length - 1;
            return last ? (
              <span>{route.breadcrumbName}</span>
            ) : (
              <a onClick={() => navigate(route.path || '/dashboard')}>{route.breadcrumbName}</a>
            );
          },
        }}
        avatarProps={{
          src: user?.avatar,
          size: 'small',
          title: user?.name,
          render: (props, dom) => (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer' }}>
                <Space>
                  <Avatar src={user?.avatar} size="small" />
                  <span
                    style={{
                      color: token.colorText,
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    {user?.name}
                  </span>
                </Space>
              </div>
            </Dropdown>
          ),
        }}
        token={{
          header: {
            colorBgMenuItemSelected: 'rgba(0,0,0,0.04)',
          },
        }}
        bgLayoutImgList={[
          {
            src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
            left: 85,
            bottom: 100,
            height: '303px',
          },
          {
            src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
            bottom: -68,
            right: -45,
            height: '303px',
          },
          {
            src: 'https://img.alicdn.com/imgextra/i3/O1CN018NxReL1shX85Yz6Cx_!!6000000005798-2-tps-884-496.png',
            bottom: 0,
            left: 0,
            width: '331px',
          },
        ]}
      >
        <Outlet />
      </ProLayout>
    </div>
  );
}
