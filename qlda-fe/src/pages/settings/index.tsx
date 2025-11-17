import { PageContainer } from '@ant-design/pro-components';
import { Tabs, Card } from 'antd';
import ProfileSettings from './ProfileSettings';
import ChangePasswordSettings from './ChangePasswordSettings';
import SercuritySettings from './SercuritySettings';
import { usePageContentHeight } from '@/hooks/usePageContentHeight';

export default function SettingsPage() {
  const { minHeight } = usePageContentHeight(); 
  const items = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      children: <ProfileSettings />,
    },
    {
      key: 'password',
      label: 'Đổi mật khẩu',
      children: <ChangePasswordSettings />,
    },
    {
      key: 'security',
      label: 'Bảo mật',
      children: <SercuritySettings />,
    },
  ];

  return (
    <PageContainer title="Cài đặt tài khoản">
      <Card style={{ minHeight}}>
        <Tabs defaultActiveKey="profile" items={items} tabPosition="left" />
      </Card>
    </PageContainer>
  );
}
