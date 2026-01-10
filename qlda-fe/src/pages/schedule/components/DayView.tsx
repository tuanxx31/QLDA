import { Card, Empty, List, Tag, Space, Typography, Timeline } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ProjectOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import type { ScheduleTask } from '@/types/schedule.type';

const { Text } = Typography;

interface DayViewProps {
    date: Dayjs;
    tasks: ScheduleTask[];
    loading?: boolean;
}

const priorityConfig: Record<string, { color: string; label: string }> = {
    high: { color: '#ff4d4f', label: 'Cao' },
    medium: { color: '#faad14', label: 'Trung bình' },
    low: { color: '#52c41a', label: 'Thấp' },
};

const formatDateVi = (date: Dayjs) => {
    return date.locale('vi').format('dddd, DD/MM/YYYY');
};

export default function DayView({ date, tasks, loading }: DayViewProps) {
    const navigate = useNavigate();

    if (loading) {
        return <Card loading style={{ minHeight: 300 }} />;
    }

    if (tasks.length === 0) {
        return (
            <Card title={formatDateVi(date)}>
                <Empty
                    description="Không có công việc nào trong ngày này"
                    style={{ padding: 40 }}
                />
            </Card>
        );
    }

    const sortedTasks = [...tasks].sort((a, b) => {
        const aTime = a.dueDate ? dayjs(a.dueDate).valueOf() : Infinity;
        const bTime = b.dueDate ? dayjs(b.dueDate).valueOf() : Infinity;
        return aTime - bTime;
    });

    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;

    return (
        <Card
            title={formatDateVi(date)}
            extra={
                <Space>
                    <Tag color="processing">{todoCount} Đang thực hiện</Tag>
                    <Tag color="success">{doneCount} hoàn thành</Tag>
                </Space>
            }
        >
            <Timeline
                items={sortedTasks.map((task) => {
                    const priority = priorityConfig[task.priority];
                    const isOverdue = task.status === 'todo' && task.dueDate && dayjs(task.dueDate).isBefore(dayjs());
                    const timeStr = task.dueDate ? dayjs(task.dueDate).format('HH:mm') : '--:--';

                    return {
                        color: task.status === 'done' ? 'green' : isOverdue ? 'red' : priority.color,
                        children: (
                            <div
                                style={{
                                    cursor: task.projectId ? 'pointer' : 'default',
                                    padding: '8px 12px',
                                    marginBottom: 8,
                                    borderRadius: 6,
                                    background: task.status === 'done' ? '#f6ffed' : isOverdue ? '#fff2f0' : '#fafafa',
                                    border: '1px solid #f0f0f0',
                                }}
                                onClick={() => task.projectId && navigate(`/projects/${task.projectId}/board`)}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                    <div style={{ flex: 1 }}>
                                        <Space>
                                            <Text strong style={{ color: '#8c8c8c', fontSize: 13 }}>
                                                {timeStr}
                                            </Text>
                                            {task.status === 'done' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                            <Text
                                                strong
                                                style={{
                                                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                                                    color: task.status === 'done' ? '#8c8c8c' : 'inherit',
                                                }}
                                            >
                                                {task.title}
                                            </Text>
                                        </Space>

                                        {task.projectName && (
                                            <div style={{ marginTop: 4 }}>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    <ProjectOutlined /> {task.projectName}
                                                    {task.columnName && ` / ${task.columnName}`}
                                                </Text>
                                            </div>
                                        )}
                                    </div>

                                    <Space>
                                        <Tag color={priority.label === 'Cao' ? 'error' : priority.label === 'Trung bình' ? 'warning' : 'success'}>
                                            {priority.label}
                                        </Tag>
                                        <Tag color={task.status === 'done' ? 'success' : 'processing'}>
                                            {task.status === 'done' ? 'Xong' : 'Đang thực hiện'}
                                        </Tag>
                                    </Space>
                                </div>

                                {task.labels && task.labels.length > 0 && (
                                    <div style={{ marginTop: 8 }}>
                                        {task.labels.map(label => (
                                            <Tag key={label.id} color={label.color} style={{ marginRight: 4 }}>
                                                {label.name}
                                            </Tag>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ),
                    };
                })}
            />
        </Card>
    );
}
