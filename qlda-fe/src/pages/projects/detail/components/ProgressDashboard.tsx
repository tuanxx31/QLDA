import { Card, Progress, Statistic, Row, Col, Table, Tag, Space, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/project.services';
import type { UserProgress } from '@/types/project.type';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getAvatarUrl } from '@/utils/avatarUtils';


interface Props {
  projectId: string;
}

export default function ProgressDashboard({ projectId }: Props) {
  const { data: projectProgress, isLoading: loadingProgress } = useQuery({
    queryKey: ['projectProgress', projectId],
    queryFn: () => projectService.getProgress(projectId),
    enabled: !!projectId,
  });

  const { data: columnProgress, isLoading: loadingColumns } = useQuery({
    queryKey: ['columnProgress', projectId],
    queryFn: () => projectService.getColumnProgress(projectId),
    enabled: !!projectId,
  });

  const { data: userProgress, isLoading: loadingUsers } = useQuery({
    queryKey: ['userProgress', projectId],
    queryFn: () => projectService.getUserProgress(projectId),
    enabled: !!projectId,
  });

  const { data: deadlineSummary, isLoading: loadingDeadline } = useQuery({
    queryKey: ['deadlineSummary', projectId],
    queryFn: () => projectService.getDeadlineSummary(projectId),
    enabled: !!projectId,
  });

  const isLoading = loadingProgress || loadingColumns || loadingUsers || loadingDeadline;


  
  const userColumns = [
    {
      title: 'Người thực hiện',
      key: 'user',
      render: (_: unknown, record: UserProgress) => (
        <Space>
          <img
            src={getAvatarUrl(record.avatar) || undefined}
            alt={record.name}
            style={{ width: 32, height: 32, borderRadius: '50%' }}
          />
          <span>{record.name}</span>
        </Space>
      ),
    },
    {
      title: 'Tổng task',
      dataIndex: 'totalTasks',
      key: 'totalTasks',
      align: 'center' as const,
    },
    {
      title: 'Đã hoàn thành',
      dataIndex: 'doneTasks',
      key: 'doneTasks',
      align: 'center' as const,
      render: (val: number) => <Tag color="success">{val}</Tag>,
    },
    {
      title: 'Chưa hoàn thành',
      dataIndex: 'todoTasks',
      key: 'todoTasks',
      align: 'center' as const,
      render: (val: number) => <Tag color="warning">{val}</Tag>,
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      render: (_: unknown, record: UserProgress) => (
        <Progress
          percent={Math.round(record.progress)}
          size="small"
          status={record.progress === 100 ? 'success' : 'active'}
        />
      ),
    },
  ];

  if (isLoading) {
    return <Card loading={true} />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {}
      <Card title="Tiến độ tổng dự án">
        <Row gutter={16}>
          <Col span={24}>
            <Progress
              percent={projectProgress ? Math.round(projectProgress.progress) : 0}
              status={projectProgress?.progress === 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Statistic
              title="Tổng số task"
              value={projectProgress?.totalTasks || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Đã hoàn thành"
              value={projectProgress?.doneTasks || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Chưa hoàn thành"
              value={projectProgress?.todoTasks || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {}
      <Card title="Phân bổ task">
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={projectProgress ? Math.round((projectProgress.doneTasks / projectProgress.totalTasks) * 100) : 0}
                format={() => `${projectProgress?.doneTasks || 0} task`}
                strokeColor="#52c41a"
              />
              <div style={{ marginTop: 8 }}>Đã hoàn thành</div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={projectProgress ? Math.round((projectProgress.todoTasks / projectProgress.totalTasks) * 100) : 0}
                format={() => `${projectProgress?.todoTasks || 0} task`}
                strokeColor="#faad14"
              />
              <div style={{ marginTop: 8 }}>Chưa hoàn thành</div>
            </div>
          </Col>
        </Row>
      </Card>

      {}
      <Card title="Tiến độ theo cột">
        {columnProgress && columnProgress.length > 0 ? (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {columnProgress.map((col) => (
              <div key={col.columnId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>
                    <strong>{col.columnName}</strong> ({col.totalTasks} task)
                  </span>
                  <span>{Math.round(col.progress)}%</span>
                </div>
                <Progress
                  percent={Math.round(col.progress)}
                  status={col.progress === 100 ? 'success' : 'active'}
                  strokeColor={
                    col.progress === 100
                      ? '#52c41a'
                      : col.progress >= 50
                        ? '#1890ff'
                        : '#faad14'
                  }
                />
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
                  <span>
                    <Tag color="success">{col.doneTasks}</Tag> đã hoàn thành
                  </span>
                  <span>
                    <Tag color="warning">{col.todoTasks}</Tag> chưa hoàn thành
                  </span>
                </div>
              </div>
            ))}
          </Space>
        ) : (
          <Empty description="Chưa có cột nào" />
        )}
      </Card>

      {}
      <Card title="Tiến độ theo người thực hiện">
        {userProgress && userProgress.length > 0 ? (
          <Table
            dataSource={userProgress}
            columns={userColumns}
            rowKey="userId"
            pagination={false}
            size="small"
          />
        ) : (
          <Empty description="Chưa có task được gán cho người dùng nào" />
        )}
      </Card>

      {}
      <Card title="Thống kê deadline">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Quá hạn"
              value={deadlineSummary?.overdue || 0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Sắp đến hạn (3 ngày)"
              value={deadlineSummary?.dueSoon || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Hoàn thành đúng hạn"
              value={deadlineSummary?.completedOnTime || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Hoàn thành trễ"
              value={deadlineSummary?.completedLate || 0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Col>
        </Row>
      </Card>
    </Space>
  );
}

