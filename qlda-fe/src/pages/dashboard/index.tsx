import { PageContainer } from '@ant-design/pro-components';
import { Typography, Card } from 'antd';
import { usePageContentHeight } from '@/hooks/usePageContentHeight';

export default function Dashboard() {
  const { minHeight } = usePageContentHeight();
  // return<>
  // <div>
  //   <h1>Dashboard</h1>
  // </div>
  // </>
  return (
    <PageContainer title="Trang tổng quan">
      <Card style={{ minHeight }}>
        <Typography.Title level={4}>
          Chào mừng bạn đến với hệ thống quản lý dự án sinh viên!
        </Typography.Title>
        <p>Hãy chọn mục bên trái để bắt đầu làm việc.</p>
      </Card>
    </PageContainer>
  );
}
