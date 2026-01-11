import { Card, Empty, Progress, Space, Tag } from 'antd';
import { Column } from '@ant-design/charts';
import type { ColumnStatistics } from '@/types/statistics.type';
import type { ColumnProgress } from '@/types/project.type';

interface Props {
  data?: ColumnStatistics[];
  columnProgress?: ColumnProgress[];
  loading?: boolean;
}

export default function ColumnStatisticsChart({ data, columnProgress, loading }: Props) {
  if (!data || data.length === 0) {
    return (
      <Card id="statistics-columns" title="Phân bố nhiệm vụ theo cột" loading={loading}>
        <Empty description="Không có dữ liệu" />
      </Card>
    );
  }

  const chartData = [
    ...data.map((item) => ({
      column: item.columnName,
      type: 'Tổng số',
      value: item.totalTasks,
    })),
    ...data.map((item) => ({
      column: item.columnName,
      type: 'Đã hoàn thành',
      value: item.doneTasks,
    })),
    ...data.map((item) => ({
      column: item.columnName,
      type: 'Chưa hoàn thành',
      value: item.todoTasks,
    })),
  ];

  return (
    <Card id="statistics-columns" title="Phân bố nhiệm vụ theo cột" loading={loading}>
      {columnProgress && columnProgress.length > 0 && (
        <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }} size="middle">
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
      )}
      <Column
        data={chartData}
        xField="column"
        yField="value"
        seriesField="type"
        isGroup={true}
        columnStyle={{
          radius: [4, 4, 0, 0],
        }}
        colorField="type"
        color={['#1890ff', '#52c41a', '#faad14']}
        legend={{
          position: 'top' as const,
        }}
        // tooltip={{
        //   shared: true,
        //   showCrosshairs: true,
        // }}
      />
    </Card>
  );
}

