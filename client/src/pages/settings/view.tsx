import { Tabs, Card } from "antd";
import { useNavigate, useLocation } from "react-router";
import ProfileSettings from "./profile";
// import PasswordSettings from "./password"; // tạo file này ở bước 3

export const SettingsView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey =
    location.pathname === "/settings/password" ? "password" : "profile";

  return (
    <Card
      title="Cài đặt tài khoản"
      style={{
        maxWidth: 800,
        margin: "0 auto",
        marginTop: 24,
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <Tabs
        activeKey={activeKey}
        onChange={(key) => navigate(`/settings/${key}`)}
        items={[
          {
            key: "profile",
            label: "Hồ sơ cá nhân",
            children: <ProfileSettings />,
          },
          {
            key: "password",
            label: "Đổi mật khẩu",
            // children: <PasswordSettings />,
          },
        ]}
      />
    </Card>
  );
};
