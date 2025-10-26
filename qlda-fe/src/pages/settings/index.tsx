import { Tabs } from "antd";
import ProfileSettings from "./ProfileSettings";
import ChangePasswordSettings from "./ChangePasswordSettings";
import SercuritySettings from "./SercuritySettings";


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
      children: <ChangePasswordSettings />,
    },
    {
      key: "security",
      label: "Bảo mật",
      children: <SercuritySettings />,
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fff", borderRadius: 8 }}>
      <Tabs defaultActiveKey="profile" items={items} tabPosition="left"/>
    </div>
  );
}
