import { Tabs } from "antd";
import ProfileSettings from "./ProfileSettings";
import ChangePassword from "./ChangePassword";


export default function SettingsPage() {
  const items = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      children: <ProfileSettings />,
    },
    {
      key: "password",
      label: "Đổi mật khẩu",
      children: <ChangePassword />,
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fff", borderRadius: 8 }}>
      <Tabs defaultActiveKey="profile" items={items} tabPosition="left"/>
    </div>
  );
}
