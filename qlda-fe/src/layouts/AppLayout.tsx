import { PageContainer, ProLayout } from "@ant-design/pro-components";
import { Outlet, useNavigate } from "react-router-dom";
import { DashboardOutlined, ProjectOutlined, UserOutlined } from "@ant-design/icons";
import ButtonLogout from "@/components/ButtonLogout";

export default function AppLayout() {
  const navigate = useNavigate();
  return (
    <ProLayout
      title="QLDA Sinh viên"
      layout="mix"
      menuItemRender={(item, dom) => (
        <div onClick={() => item.path && navigate(item.path)}>{dom}</div>
      )}
      route={{
        routes: [
          { path: "/dashboard", name: "Bảng điều khiển", icon: <DashboardOutlined /> },
          { path: "/projects", name: "Dự án", icon: <ProjectOutlined /> },
          { path: "/profile", name: "Hồ sơ cá nhân", icon: <UserOutlined /> },
        ],
      }}
      rightContentRender={() => <ButtonLogout />}
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </ProLayout>
  );
}
