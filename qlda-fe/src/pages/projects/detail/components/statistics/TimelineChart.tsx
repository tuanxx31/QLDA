import { Card, Select, DatePicker, Space, Empty } from 'antd';
import { Line } from '@ant-design/charts';
import dayjs, { type Dayjs } from 'dayjs';
import { useState, useMemo } from 'react';
import type { TimelineStatistics } from '@/types/statistics.type';

const { RangePicker } = DatePicker;

interface Props {
  data?: TimelineStatistics[];
  loading?: boolean;
  onFilterChange?: (params: { period: 'day' | 'week' | 'month'; startDate?: string; endDate?: string }) => void;
}

export default function TimelineChart({ data, loading, onFilterChange }: Props) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const handlePeriodChange = (value: 'day' | 'week' | 'month') => {
    setPeriod(value);
    if (onFilterChange) {
      onFilterChange({
        period: value,
        startDate: dateRange?.[0]?.toISOString(),
        endDate: dateRange?.[1]?.toISOString(),
      });
    }
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
    if (onFilterChange) {
      onFilterChange({
        period,
        startDate: dates?.[0]?.toISOString(),
        endDate: dates?.[1]?.toISOString(),
      });
    }
  };

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.flatMap((item) => [
      {
        date: item.date,
        type: 'Đã tạo',
        value: item.createdTasks,
      },
      {
        date: item.date,
        type: 'Đã hoàn thành',
        value: item.completedTasks,
      },
      {
        date: item.date,
        type: 'Đúng hạn',
        value: item.onTimeTasks,
      },
      {
        date: item.date,
        type: 'Trễ hạn',
        value: item.lateTasks,
      },
    ]);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card
        id="statistics-timeline"
        title="Thống kê theo thời gian"
        loading={loading}
        extra={
          <Space>
            <Select
              value={period}
              onChange={handlePeriodChange}
              style={{ width: 120 }}
              options={[
                { label: 'Theo ngày', value: 'day' },
                { label: 'Theo tuần', value: 'week' },
                { label: 'Theo tháng', value: 'month' },
              ]}
            />
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
            />
          </Space>
        }
      >
        <Empty description="Không có dữ liệu" />
      </Card>
    );
  }

  return (
    <Card
      id="statistics-timeline"
      title="Thống kê theo thời gian"
      loading={loading}
      extra={
        <Space>
          <Select
            value={period}
            onChange={handlePeriodChange}
            style={{ width: 120 }}
            options={[
              { label: 'Theo ngày', value: 'day' },
              { label: 'Theo tuần', value: 'week' },
              { label: 'Theo tháng', value: 'month' },
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
          />
        </Space>
      }
    >
      <Line
        data={chartData}
        xField="date"
        yField="value"
        seriesField="type"
        smooth={true}
        colorField={"type"}
        legend={{
          position: 'top' as const,
        }}
        tooltip={{
          shared: true,
          showCrosshairs: true,
        }}
        point={{
          size: 4,
          shape: 'circle',
        }}
      />
    </Card>
  );
}

