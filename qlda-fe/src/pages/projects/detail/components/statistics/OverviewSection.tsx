import { Card, Row, Col, Statistic, Progress } from 'antd';
import { FolderOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ProjectOverview } from '@/types/statistics.type';
import type { ProjectProgress } from '@/types/project.type';

interface Props {
  data?: ProjectOverview;
  projectProgress?: ProjectProgress;
  loading?: boolean;
}

export default function OverviewSection({ data, projectProgress, loading }: Props) {
  const progressPercent = projectProgress
    ? Math.round(projectProgress.progress)
    : data && data.totalTasks > 0
      ? Math.round((data.doneTasks / data.totalTasks) * 100)
      : 0;

  return (
    <Card id="statistics-overview" title="Tổng quan dự án" loading={loading}>
      {projectProgress && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Progress
              percent={progressPercent}
              status={progressPercent === 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="Tổng số cột"
            value={data?.totalColumns || 0}
            prefix={<FolderOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="Tổng số nhiệm vụ"
            value={data?.totalTasks || 0}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="Đã hoàn thành"
            value={data?.doneTasks || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="Chưa hoàn thành"
            value={data?.todoTasks || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Statistic
            title="Quá hạn"
            value={data?.overdueTasks || 0}
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Col>
      </Row>
    </Card>
  );
}

