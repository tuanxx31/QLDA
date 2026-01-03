import { Card, Table, Tabs, Tag, Empty, Row, Col, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { DeadlineAnalytics, TaskDeadline } from '@/types/statistics.type';
import type { DeadlineSummary } from '@/types/project.type';

interface Props {
  data?: DeadlineAnalytics;
  deadlineSummary?: DeadlineSummary;
  loading?: boolean;
}

export default function DeadlineAnalyticsTable({ data, deadlineSummary, loading }: Props) {
  const columns: ColumnsType<TaskDeadline> = [
    {
      title: 'Nhiệm vụ',
      dataIndex: 'taskTitle',
      key: 'taskTitle',
    },
    {
      title: 'Hạn chót',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => (
        <Tag color={value === 'done' ? 'success' : 'warning'}>
          {value === 'done' ? 'Hoàn thành' : 'Chưa hoàn thành'}
        </Tag>
      ),
    },
    {
      title: 'Hoàn thành lúc',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (value: string | null) =>
        value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-',
    },
  ];

  if (!data) {
    return (
      <Card id="statistics-deadlines" title="Thống kê hạn chót" loading={loading}>
        <Empty description="Không có dữ liệu" />
      </Card>
    );
  }

  const tabItems = [
    {
      key: 'overdue',
      label: `Quá hạn (${data.overdueTasks})`,
      children: (
        <Table
          columns={columns}
          dataSource={data.overdueTasksList}
          rowKey="taskId"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="Không có nhiệm vụ quá hạn" /> }}
        />
      ),
    },
    {
      key: 'dueSoon',
      label: `Sắp đến hạn (${data.dueSoonTasks})`,
      children: (
        <Table
          columns={columns}
          dataSource={data.dueSoonTasksList}
          rowKey="taskId"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="Không có nhiệm vụ sắp đến hạn" /> }}
        />
      ),
    },
    {
      key: 'onTime',
      label: `Hoàn thành đúng hạn (${data.completedOnTime})`,
      children: (
        <Table
          columns={columns}
          dataSource={data.completedOnTimeList}
          rowKey="taskId"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="Không có nhiệm vụ hoàn thành đúng hạn" /> }}
        />
      ),
    },
    {
      key: 'late',
      label: `Hoàn thành trễ hạn (${data.completedLate})`,
      children: (
        <Table
          columns={columns}
          dataSource={data.completedLateList}
          rowKey="taskId"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="Không có nhiệm vụ hoàn thành trễ hạn" /> }}
        />
      ),
    },
  ];

  return (
    <Card id="statistics-deadlines" title="Thống kê hạn chót" loading={loading}>
      {(deadlineSummary || data) && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic
              title="Quá hạn"
              value={deadlineSummary?.overdue || data?.overdueTasks || 0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Sắp đến hạn (3 ngày)"
              value={deadlineSummary?.dueSoon || data?.dueSoonTasks || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Hoàn thành đúng hạn"
              value={deadlineSummary?.completedOnTime || data?.completedOnTime || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Hoàn thành trễ"
              value={deadlineSummary?.completedLate || data?.completedLate || 0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Col>
        </Row>
      )}
      <Tabs items={tabItems} />
    </Card>
  );
}

