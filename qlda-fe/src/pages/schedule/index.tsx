import { PageContainer } from '@ant-design/pro-components';
import { Card, Space, Typography, Statistic, Row, Col, Tag, Empty, Progress, DatePicker, Button, Select, Segmented, Spin } from 'antd';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { scheduleService } from '@/services/schedule.services';
import CalendarView from './components/CalendarView';
import DayView from './components/DayView';
import { usePageContentHeight } from '@/hooks/usePageContentHeight';

const { Text } = Typography;

type ViewMode = 'month' | 'day';
type StatusFilter = 'all' | 'todo' | 'done';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export default function SchedulePage() {
    const { minHeight } = usePageContentHeight();
    const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

    
    const { startDate, endDate } = useMemo(() => {
        if (viewMode === 'day') {
            return {
                startDate: currentDate.startOf('day').format('YYYY-MM-DD'),
                endDate: currentDate.endOf('day').format('YYYY-MM-DD'),
            };
        }
        const start = currentDate.startOf('month').subtract(7, 'day');
        const end = currentDate.endOf('month').add(7, 'day');
        return {
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD'),
        };
    }, [currentDate, viewMode]);

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['schedule', 'my', startDate, endDate],
        queryFn: () => scheduleService.getMySchedule(startDate, endDate),
    });

    
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (statusFilter !== 'all' && task.status !== statusFilter) return false;
            if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
            return true;
        });
    }, [tasks, statusFilter, priorityFilter]);

    
    const stats = useMemo(() => {
        const total = tasks.length;
        const done = tasks.filter(t => t.status === 'done').length;
        const todo = tasks.filter(t => t.status === 'todo').length;
        const overdue = tasks.filter(t => {
            if (t.status === 'done') return false;
            if (!t.dueDate) return false;
            return dayjs(t.dueDate).isBefore(dayjs(), 'day');
        }).length;

        return { total, done, todo, overdue };
    }, [tasks]);

    
    const dayTasks = useMemo(() => {
        if (viewMode !== 'day') return [];
        const dateKey = currentDate.format('YYYY-MM-DD');
        return filteredTasks.filter(task => {
            const start = task.startDate ? dayjs(task.startDate).format('YYYY-MM-DD') : null;
            const end = task.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : null;

            if (start && end) {
                return dateKey >= start && dateKey <= end;
            }
            return start === dateKey || end === dateKey;
        }).sort((a, b) => {
            const aTime = a.dueDate ? dayjs(a.dueDate).valueOf() : 0;
            const bTime = b.dueDate ? dayjs(b.dueDate).valueOf() : 0;
            return aTime - bTime;
        });
    }, [filteredTasks, currentDate, viewMode]);

    const progressPercent = stats.total > 0
        ? Math.round((stats.done / stats.total) * 100)
        : 0;

    const handleMonthChange = (date: Dayjs) => {
        setCurrentDate(date);
    };

    const handlePrevious = () => {
        if (viewMode === 'day') {
            setCurrentDate(prev => prev.subtract(1, 'day'));
        } else {
            setCurrentDate(prev => prev.subtract(1, 'month'));
        }
    };

    const handleNext = () => {
        if (viewMode === 'day') {
            setCurrentDate(prev => prev.add(1, 'day'));
        } else {
            setCurrentDate(prev => prev.add(1, 'month'));
        }
    };

    const handleToday = () => {
        setCurrentDate(dayjs());
    };

    const handleSelectDate = (date: Dayjs) => {
        setCurrentDate(date);
        setViewMode('day');
    };

    return (
        <PageContainer title="Lịch làm việc">
            <Spin spinning={isLoading} tip="Đang tải dữ liệu...">
                <Card style={{ minHeight }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {}
                        <Card title="Tổng quan công việc của tôi" size="small" loading={isLoading}>
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={24}>
                                    <Progress
                                        percent={progressPercent}
                                        status={progressPercent === 100 ? 'success' : 'active'}
                                        strokeColor={{
                                            '0%': '#108ee9',
                                            '100%': '#87d068',
                                        }}
                                        format={(percent) => `${percent}% hoàn thành`}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={12} sm={6}>
                                    <Statistic
                                        title="Tổng công việc"
                                        value={stats.total}
                                        prefix={<CalendarOutlined />}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Statistic
                                        title="Đã hoàn thành"
                                        value={stats.done}
                                        prefix={<CheckCircleOutlined />}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Statistic
                                        title="Đang thực hiện"
                                        value={stats.todo}
                                        prefix={<ClockCircleOutlined />}
                                        valueStyle={{ color: '#faad14' }}
                                    />
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Statistic
                                        title="Quá hạn"
                                        value={stats.overdue}
                                        prefix={<ExclamationCircleOutlined />}
                                        valueStyle={{ color: '#ff4d4f' }}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {}
                        <Card size="small">
                            <Row gutter={[16, 16]} align="middle">
                                {}
                                <Col>
                                    <Segmented
                                        value={viewMode}
                                        onChange={(value) => setViewMode(value as ViewMode)}
                                        options={[
                                            { label: 'Tháng', value: 'month' },
                                            { label: 'Ngày', value: 'day' },
                                        ]}
                                    />
                                </Col>

                                {}
                                <Col>
                                    <Space>
                                        <Button icon={<LeftOutlined />} onClick={handlePrevious} />
                                        <DatePicker
                                            value={currentDate}
                                            onChange={(date) => date && setCurrentDate(date)}
                                            picker={viewMode === 'day' ? 'date' : 'month'}
                                            allowClear={false}
                                            format={viewMode === 'day' ? 'DD/MM/YYYY' : 'MM/YYYY'}
                                        />
                                        <DatePicker
                                            value={currentDate}
                                            onChange={(date) => date && setCurrentDate(date)}
                                            picker="year"
                                            allowClear={false}
                                            format="YYYY"
                                            style={{ width: 80 }}
                                        />
                                        <Button icon={<RightOutlined />} onClick={handleNext} />
                                        <Button onClick={handleToday}>Hôm nay</Button>
                                    </Space>
                                </Col>

                                {}
                                <Col flex="auto">
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                                        <Select
                                            value={statusFilter}
                                            onChange={setStatusFilter}
                                            style={{ width: 140 }}
                                            options={[
                                                { label: 'Tất cả trạng thái', value: 'all' },
                                                { label: 'Đang thực hiện', value: 'todo' },
                                                { label: 'Hoàn thành', value: 'done' },
                                            ]}
                                        />
                                        <Select
                                            value={priorityFilter}
                                            onChange={setPriorityFilter}
                                            style={{ width: 140 }}
                                            options={[
                                                { label: 'Tất cả ưu tiên', value: 'all' },
                                                { label: 'Ưu tiên cao', value: 'high' },
                                                { label: 'Ưu tiên TB', value: 'medium' },
                                                { label: 'Ưu tiên thấp', value: 'low' },
                                            ]}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                        {}
                        {viewMode === 'month' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                <Text type="secondary">Mức độ ưu tiên:</Text>
                                <Tag color="error">Cao</Tag>
                                <Tag color="warning">Trung bình</Tag>
                                <Tag color="success">Thấp</Tag>
                                <Text type="secondary" style={{ marginLeft: 'auto' }}>
                                    Click vào ngày để xem chi tiết
                                </Text>
                            </div>
                        )}

                        {}
                        {viewMode === 'month' ? (
                            filteredTasks.length === 0 && !isLoading ? (
                                <Empty
                                    description="Không có công việc nào trong tháng này"
                                    style={{ padding: 40 }}
                                />
                            ) : (
                                <CalendarView
                                    tasks={filteredTasks}
                                    loading={isLoading}
                                    onMonthChange={handleMonthChange}
                                    currentMonth={currentDate}
                                    onSelectDate={handleSelectDate}
                                />
                            )
                        ) : (
                            <DayView
                                date={currentDate}
                                tasks={dayTasks}
                                loading={isLoading}
                            />
                        )}
                    </Space>
                </Card>
            </Spin>
        </PageContainer>
    );
}
