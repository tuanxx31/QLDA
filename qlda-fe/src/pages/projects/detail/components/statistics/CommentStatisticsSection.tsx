import { Card, Table, Statistic, Select, Row, Col, Avatar, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import type { CommentStatistics, CommentByTask, CommentByMember } from '@/types/statistics.type';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { UserOutlined } from '@ant-design/icons';
interface Props {
  data?: CommentStatistics;
  loading?: boolean;
  onFilterChange?: (filter: '24h' | '7d' | 'all') => void;
}

export default function CommentStatisticsSection({ data, loading, onFilterChange }: Props) {
  const [filter, setFilter] = useState<'24h' | '7d' | 'all'>('all');

  const handleFilterChange = (value: '24h' | '7d' | 'all') => {
    setFilter(value);
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  const taskColumns: ColumnsType<CommentByTask> = [
    {
      title: 'Nhiệm vụ',
      dataIndex: 'taskTitle',
      key: 'taskTitle',
    },
    {
      title: 'Số bình luận',
      dataIndex: 'commentCount',
      key: 'commentCount',
      sorter: (a, b) => a.commentCount - b.commentCount,
      defaultSortOrder: 'descend' as const,
      render: (value: number) => <strong>{value}</strong>,
    },
  ];

  const memberColumns: ColumnsType<CommentByMember> = [
    {
      title: 'Thành viên',
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string, record: CommentByMember) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar src={getAvatarUrl(record.avatar)} icon={!record.avatar && <UserOutlined />} alt={text} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Số bình luận',
      dataIndex: 'commentCount',
      key: 'commentCount',
      sorter: (a, b) => a.commentCount - b.commentCount,
      defaultSortOrder: 'descend' as const,
      render: (value: number) => <strong>{value}</strong>,
    },
  ];

  if (!data) {
    return (
      <Card id="statistics-comments" title="Thống kê bình luận" loading={loading}>
        <Empty description="Không có dữ liệu" />
      </Card>
    );
  }

  return (
    <Card
      id="statistics-comments"
      title="Thống kê bình luận"
      loading={loading}
      extra={
        <Select
          value={filter}
          onChange={handleFilterChange}
          style={{ width: 150 }}
          options={[
            { label: '24 giờ qua', value: '24h' },
            { label: '7 ngày qua', value: '7d' },
            { label: 'Tất cả', value: 'all' },
          ]}
        />
      }
    >
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="Tổng số bình luận"
            value={data.totalComments}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="Bình luận gần đây"
            value={data.recentComments}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Top nhiệm vụ có nhiều bình luận" size="small">
            {data.commentsByTask.length === 0 ? (
              <Empty description="Không có dữ liệu" />
            ) : (
              <Table
                columns={taskColumns}
                dataSource={data.commentsByTask}
                rowKey="taskId"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top thành viên có nhiều bình luận" size="small">
            {data.commentsByMember.length === 0 ? (
              <Empty description="Không có dữ liệu" />
            ) : (
              <Table
                columns={memberColumns}
                dataSource={data.commentsByMember}
                rowKey="userId"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>
      </Row>
    </Card>
  );
}

