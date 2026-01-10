import { Card, Typography, Space, Button, Tag, List, Spin, Empty, Alert, Tooltip, message, Checkbox } from 'antd';
import { RobotOutlined, ReloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.services';
import { taskService } from '@/services/task.services';
import type { TaskSuggestion, ScheduleSuggestionResponse } from '@/services/ai.services';
import type { Dayjs } from 'dayjs';
import { useState, useCallback, useEffect } from 'react';
import './AIScheduleSuggestion.css';

const { Text } = Typography;

interface AIScheduleSuggestionProps {
    currentDate: Dayjs;
}

const priorityColors: Record<string, string> = {
    high: 'red',
    medium: 'orange',
    low: 'green',
};

const priorityLabels: Record<string, string> = {
    high: 'Cao',
    medium: 'TB',
    low: 'Thấp',
};

const getSuggestionStorageKey = (date: string) => `ai_suggestions_${date}`;

export default function AIScheduleSuggestion({ currentDate }: AIScheduleSuggestionProps) {
    const [expanded, setExpanded] = useState(true);
    const [suggestions, setSuggestions] = useState<ScheduleSuggestionResponse | null>(null);
    const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const dateString = currentDate.format('YYYY-MM-DD');
    const storageKey = getSuggestionStorageKey(dateString);

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSuggestions(parsed.suggestions);
                setCompletedTaskIds(new Set(parsed.completedTaskIds || []));
            } catch {
                localStorage.removeItem(storageKey);
            }
        }
    }, [storageKey]);

    useEffect(() => {
        if (suggestions) {
            const data = {
                suggestions,
                completedTaskIds: Array.from(completedTaskIds),
                savedAt: new Date().toISOString(),
            };
            localStorage.setItem(storageKey, JSON.stringify(data));
        }
    }, [suggestions, completedTaskIds, storageKey]);

    const { mutate: generateSuggestions, isPending } = useMutation({
        mutationFn: () => aiService.suggestSchedule(dateString),
        onSuccess: (data) => {
            setSuggestions(data);
            setCompletedTaskIds(new Set());
            message.success('Đã tạo gợi ý thành công!');
        },
        onError: () => {
            message.error('Không thể tạo gợi ý. Vui lòng thử lại.');
        },
    });

    const handleGenerate = useCallback(() => {
        generateSuggestions();
    }, [generateSuggestions]);

    const handleCompleteTask = useCallback(async (taskId: string, taskTitle: string) => {
        setCompletingTaskId(taskId);
        try {
            await taskService.updateStatus(taskId, 'done');
            setCompletedTaskIds(prev => {
                const newSet = new Set(prev);
                newSet.add(taskId);
                return newSet;
            });
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
            message.success(`Đã hoàn thành: "${taskTitle}"`);
        } catch {
            message.error('Không thể cập nhật trạng thái task.');
        } finally {
            setCompletingTaskId(null);
        }
    }, [queryClient]);

    const visibleSuggestions = suggestions?.suggestions?.filter(
        s => !completedTaskIds.has(s.taskId)
    ) || [];

    const hasGenerated = suggestions !== null;

    const renderSuggestionItem = (suggestion: TaskSuggestion) => {
        const isCompleting = completingTaskId === suggestion.taskId;

        return (
            <List.Item className="ai-suggestion-item">
                <div className="suggestion-content">
                    <div className="suggestion-header">
                        <div className="suggestion-checkbox">
                            {isCompleting ? (
                                <LoadingOutlined style={{ color: '#1890ff' }} />
                            ) : (
                                <Checkbox
                                    onChange={() => handleCompleteTask(suggestion.taskId, suggestion.taskTitle)}
                                />
                            )}
                        </div>
                        <div className="suggestion-order">
                            <span className="order-number">{suggestion.order}</span>
                        </div>
                        <div className="suggestion-details">
                            <div className="suggestion-title-row">
                                <Text strong>{suggestion.taskTitle}</Text>
                                <Tag color={priorityColors[suggestion.priority]}>
                                    {priorityLabels[suggestion.priority]}
                                </Tag>
                                <Tag>{suggestion.suggestedStartTime}</Tag>
                            </div>
                            <div className="suggestion-reason">
                                {suggestion.reason}
                            </div>
                        </div>
                    </div>
                </div>
            </List.Item>
        );
    };

    if (!expanded) {
        return (
            <Card
                size="small"
                className="ai-suggestion-card collapsed"
                onClick={() => setExpanded(true)}
            >
                <Space>
                    <RobotOutlined />
                    <Text>Gợi ý AI</Text>
                    {hasGenerated && visibleSuggestions.length > 0 && (
                        <Tag color="blue">{visibleSuggestions.length} task</Tag>
                    )}
                </Space>
            </Card>
        );
    }

    return (
        <Card
            size="small"
            title={
                <Space>
                    <RobotOutlined />
                    <span>Gợi ý lịch làm việc</span>
                </Space>
            }
            extra={
                <Space>
                    <Button
                        type={hasGenerated ? 'default' : 'primary'}
                        icon={isPending ? <ReloadOutlined spin /> : <RobotOutlined />}
                        onClick={handleGenerate}
                        disabled={isPending}
                        size="small"
                    >
                        {hasGenerated ? 'Tạo mới' : 'Tạo gợi ý'}
                    </Button>
                    <Button size="small" type="text" onClick={() => setExpanded(false)}>
                        Thu gọn
                    </Button>
                </Space>
            }
        >
            <Spin spinning={isPending} tip="Đang phân tích...">
                {!hasGenerated ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Nhấn 'Tạo gợi ý' để AI phân tích lịch làm việc"
                    />
                ) : suggestions ? (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {suggestions.summary && (
                            <Alert type="info" message={suggestions.summary} showIcon />
                        )}

                        {completedTaskIds.size > 0 && (
                            <Alert
                                type="success"
                                message={`Đã hoàn thành ${completedTaskIds.size} task. Còn ${visibleSuggestions.length} task.`}
                                showIcon
                            />
                        )}

                        {suggestions.warnings?.length > 0 && (
                            <Alert
                                type="warning"
                                message={suggestions.warnings.join('. ')}
                                showIcon
                            />
                        )}

                        {visibleSuggestions.length > 0 ? (
                            <List
                                dataSource={visibleSuggestions}
                                renderItem={renderSuggestionItem}
                                split
                            />
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    completedTaskIds.size > 0
                                        ? "Đã hoàn thành tất cả task!"
                                        : "Không có task nào cần làm."
                                }
                            />
                        )}
                    </Space>
                ) : null}
            </Spin>
        </Card>
    );
}
