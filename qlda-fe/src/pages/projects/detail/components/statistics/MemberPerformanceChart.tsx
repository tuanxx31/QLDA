import { Card, Empty } from 'antd';
import { Column } from '@ant-design/charts';
import type { MemberStatistics } from '@/types/statistics.type';

interface Props {
  data?: MemberStatistics[];
  loading?: boolean;
}

export default function MemberPerformanceChart({ data, loading }: Props) {
  if (!data || data.length === 0) {
    return (
      <Card id="statistics-members-performance" title="Hiệu suất thành viên" loading={loading}>
        <Empty description="Không có dữ liệu" />
      </Card>
    );
  }

  const chartData = data.slice(0, 10).flatMap((member) => [
    {
      member: member.name,
      type: 'Tổng số',
      value: member.totalTasks,
    },
    {
      member: member.name,
      type: 'Đã hoàn thành',
      value: member.doneTasks,
    },
    {
      member: member.name,
      type: 'Quá hạn',
      value: member.overdueTasks,
    },
  ]);

  return (
    <Card id="statistics-members-performance" title="Hiệu suất thành viên" loading={loading}>
      <Column
        data={chartData}
        xField="member"
        yField="value"
        seriesField="type"
        isGroup={true}
        columnStyle={{
          radius: [4, 4, 0, 0],
        }}
        colorField="type"
        color={['#1890ff', '#52c41a', '#ff4d4f']}
        legend={{
          position: 'top' as const,
        }}
        tooltip={{
          shared: true,
          showCrosshairs: true,
        }}
        label={{
          position: 'top' as const,
        }}
      />
    </Card>
  );
}

