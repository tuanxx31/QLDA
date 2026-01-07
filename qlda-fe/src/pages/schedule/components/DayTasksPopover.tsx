import { Popover, Tag, Typography, Space, Divider, List, Button } from 'antd';
import { ClockCircleOutlined, ProjectOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import type { ScheduleTask } from '@/types/schedule.type';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Text } = Typography;

interface DayTasksPopoverProps {
    tasks: ScheduleTask[];
    date: dayjs.Dayjs;
    children: React.ReactNode;
    onViewDay?: () => void;
}

const priorityConfig: Record<string, { color: string; label: string }> = {
    high: { color: 'error', label: 'Cao' },
    medium: { color: 'warning', label: 'TB' },
    low: { color: 'success', label: 'Thấp' },
};

export default function DayTasksPopover({ tasks, date, children, onViewDay }: DayTasksPopoverProps) {
    const navigate = useNavigate();

    if (tasks.length === 0) {
        return <>{children}</>;
    }

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const content = (
        <div style={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
            {/* Summary */}
            <Space style={{ marginBottom: 8 }}>
                <Tag color="processing">{todoTasks.length} Đang thực hiện</Tag>
                <Tag color="success">{doneTasks.length} hoàn thành</Tag>
            </Space>

            <Divider style={{ margin: '8px 0' }} />

            {/* Task List */}
            <List
                size="small"
                dataSource={tasks.slice(0, 5)}
                renderItem={(task) => {
                    const priority = priorityConfig[task.priority];
                    const isOverdue = task.status === 'todo' && task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day');

                    return (
                        <List.Item
                            style={{
                                cursor: task.projectId ? 'pointer' : 'default',
                                padding: '8px 0',
                            }}
                            onClick={() => task.projectId && navigate(`/projects/${task.projectId}/board`)}
                        >
                            <div style={{ width: '100%' }}>
                                {/* Title */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {task.status === 'done' && (
                                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    )}
                                    <Text
                                        strong
                                        style={{
                                            textDecoration: task.status === 'done' ? 'line-through' : 'none',
                                            color: task.status === 'done' ? '#8c8c8c' : 'inherit',
                                        }}
                                    >
                                        {task.title}
                                    </Text>
                                </div>

                                {/* Project */}
                                {task.projectName && (
                                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                                        <ProjectOutlined /> {task.projectName}
                                    </div>
                                )}

                                {/* Tags */}
                                <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    <Tag color={priority.color} style={{ margin: 0 }}>
                                        {priority.label}
                                    </Tag>
                                    {task.dueDate && (
                                        <Tag
                                            icon={<ClockCircleOutlined />}
                                            color={isOverdue ? 'error' : 'default'}
                                            style={{ margin: 0 }}
                                        >
                                            {dayjs(task.dueDate).format('HH:mm')}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        </List.Item>
                    );
                }}
            />

            {/* View all button */}
            {(tasks.length > 5 || onViewDay) && (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={onViewDay}
                    style={{ padding: 0, marginTop: 8 }}
                >
                    {tasks.length > 5 ? `Xem tất cả ${tasks.length} công việc` : 'Xem chi tiết ngày'}
                </Button>
            )}
        </div>
    );

    return (
        <Popover
            content={content}
            title={`📅 ${date.format('DD/MM/YYYY')} - ${tasks.length} công việc`}
            trigger="hover"
            placement="right"
            mouseEnterDelay={0}
            mouseLeaveDelay={0.1}
        >
            {children}
        </Popover>
    );
}
