import { Calendar, Badge, Spin } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import type { ScheduleTask } from '@/types/schedule.type';
import DayTasksPopover from './DayTasksPopover';

interface CalendarViewProps {
    tasks: ScheduleTask[];
    loading?: boolean;
    onMonthChange: (date: Dayjs) => void;
    currentMonth: Dayjs;
    onSelectDate?: (date: Dayjs) => void;
}

export default function CalendarView({ tasks, loading, onMonthChange, currentMonth, onSelectDate }: CalendarViewProps) {
    
    const tasksByDate = useMemo(() => {
        const map = new Map<string, ScheduleTask[]>();

        tasks.forEach((task) => {
            const start = task.startDate ? dayjs(task.startDate) : null;
            const end = task.dueDate ? dayjs(task.dueDate) : null;

            if (start && end) {
                let current = start.startOf('day');
                const endDay = end.startOf('day');
                while (current.isBefore(endDay) || current.isSame(endDay, 'day')) {
                    const key = current.format('YYYY-MM-DD');
                    const existing = map.get(key) || [];
                    if (!existing.find(t => t.id === task.id)) {
                        existing.push(task);
                    }
                    map.set(key, existing);
                    current = current.add(1, 'day');
                }
            } else if (start) {
                const key = start.format('YYYY-MM-DD');
                const existing = map.get(key) || [];
                if (!existing.find(t => t.id === task.id)) {
                    existing.push(task);
                }
                map.set(key, existing);
            } else if (end) {
                const key = end.format('YYYY-MM-DD');
                const existing = map.get(key) || [];
                if (!existing.find(t => t.id === task.id)) {
                    existing.push(task);
                }
                map.set(key, existing);
            }
        });

        return map;
    }, [tasks]);

    const dateCellRender = (date: Dayjs) => {
        const key = date.format('YYYY-MM-DD');
        const dayTasks = tasksByDate.get(key) || [];

        if (dayTasks.length === 0) return null;

        const todoTasks = dayTasks.filter(t => t.status === 'todo');
        const doneTasks = dayTasks.filter(t => t.status === 'done');
        const highCount = todoTasks.filter(t => t.priority === 'high').length;
        const mediumCount = todoTasks.filter(t => t.priority === 'medium').length;
        const lowCount = todoTasks.filter(t => t.priority === 'low').length;

        return (
            <DayTasksPopover tasks={dayTasks} date={date} onViewDay={() => onSelectDate?.(date)}>
                <div style={{ cursor: 'pointer', minHeight: 50 }}>
                    {}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                        {highCount > 0 && (
                            <Badge count={highCount} color="#ff4d4f" size="small" />
                        )}
                        {mediumCount > 0 && (
                            <Badge count={mediumCount} color="#faad14" size="small" />
                        )}
                        {lowCount > 0 && (
                            <Badge count={lowCount} color="#52c41a" size="small" />
                        )}
                    </div>

                    {}
                    {doneTasks.length > 0 && (
                        <div style={{ fontSize: 11, color: '#52c41a' }}>
                            ✓ {doneTasks.length}/{dayTasks.length}
                        </div>
                    )}
                </div>
            </DayTasksPopover>
        );
    };

    const handlePanelChange = (date: Dayjs) => {
        onMonthChange(date);
    };

    return (
        <Spin spinning={loading}>
            <Calendar
                value={currentMonth}
                cellRender={(date, info) => {
                    if (info.type === 'date') {
                        return dateCellRender(date);
                    }
                    return info.originNode;
                }}
                onPanelChange={handlePanelChange}
                headerRender={() => null}
            />
        </Spin>
    );
}
