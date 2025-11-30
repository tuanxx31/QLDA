import { Card, Table, Avatar, Progress, Tag, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MemberStatistics } from '@/types/statistics.type';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { UserOutlined } from '@ant-design/icons';
interface Props {
  data?: MemberStatistics[];
  loading?: boolean;
}

export default function MemberStatisticsTable({ data, loading }: Props) {
  const columns: ColumnsType<MemberStatistics> = [
    {
      title: 'Thành viên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MemberStatistics) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar src={getAvatarUrl(record.avatar)} icon={!record.avatar && <UserOutlined />} alt={text} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Tổng số nhiệm vụ',
      dataIndex: 'totalTasks',
      key: 'totalTasks',
      sorter: (a, b) => a.totalTasks - b.totalTasks,
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Đã hoàn thành',
      dataIndex: 'doneTasks',
      key: 'doneTasks',
      render: (value: number) => (
        <Tag color="success">{value}</Tag>
      ),
    },
    {
      title: 'Chưa hoàn thành',
      dataIndex: 'todoTasks',
      key: 'todoTasks',
      render: (value: number) => (
        <Tag color="warning">{value}</Tag>
      ),
    },
    {
      title: 'Quá hạn',
      dataIndex: 'overdueTasks',
      key: 'overdueTasks',
      render: (value: number) => (
        <Tag color="error">{value}</Tag>
      ),
    },
    {
      title: 'Tỷ lệ hoàn thành',
      dataIndex: 'completionRate',
      key: 'completionRate',
      sorter: (a, b) => a.completionRate - b.completionRate,
      render: (value: number) => (
        <Progress
          percent={Math.round(value)}
          status={value === 100 ? 'success' : 'active'}
          size="small"
          style={{ minWidth: 100 }}
        />
      ),
    },
  ];

  if (!data || data.length === 0) {
    return (
      <Card id="statistics-members" title="Thống kê theo thành viên" loading={loading}>
        <Empty description="Không có dữ liệu" />
      </Card>
    );
  }

  return (
    <Card id="statistics-members" title="Thống kê theo thành viên" loading={loading}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="userId"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}

