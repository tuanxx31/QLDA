import { PageContainer } from '@ant-design/pro-components';
import { Result, Button, Card } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') || 'Bạn không có quyền truy cập trang này';

  const getBackPath = () => {
    const from = searchParams.get('from');
    if (from === 'project') return '/projects';
    if (from === 'group') return '/groups';
    return '/dashboard';
  };

  return (
    <PageContainer>
      <Card>
        <Result
          status="403"
          title="403"
          subTitle={message}
          extra={[
            <Button
              type="primary"
              key="home"
              icon={<HomeOutlined />}
              onClick={() => navigate('/dashboard')}
            >
              Về trang chủ
            </Button>,
            <Button
              key="back"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(getBackPath())}
            >
              Quay lại
            </Button>,
          ]}
        />
      </Card>
    </PageContainer>
  );
}

