import { Card, Typography, Space, Button, Tag, List, Spin, Empty, Alert, Tooltip, message, Checkbox } from 'antd';
import { RobotOutlined, ReloadOutlined, BulbOutlined, WarningOutlined, ClockCircleOutlined, ThunderboltOutlined, LoadingOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.services';
import { taskService } from '@/services/task.services';
import type { TaskSuggestion, ScheduleSuggestionResponse } from '@/services/ai.services';
import type { Dayjs } from 'dayjs';
import { useState, useCallback, useEffect } from 'react';
import './AIScheduleSuggestion.css';

const { Text, Title } = Typography;

interface AIScheduleSuggestionProps {
    currentDate: Dayjs;
}

const priorityColors: Record<string, string> = {
    high: '#ff4d4f',
    medium: '#faad14',
    low: '#52c41a',
};

const priorityLabels: Record<string, string> = {
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
};

// LocalStorage key for suggestions
const getSuggestionStorageKey = (date: string) => `ai_suggestions_${date}`;

export default function AIScheduleSuggestion({ currentDate }: AIScheduleSuggestionProps) {
    const [expanded, setExpanded] = useState(true);
    const [suggestions, setSuggestions] = useState<ScheduleSuggestionResponse | null>(null);
    const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const dateString = currentDate.format('YYYY-MM-DD');
    const storageKey = getSuggestionStorageKey(dateString);

    // Load saved suggestions from localStorage on mount
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

    // Save suggestions to localStorage whenever they change
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

    // Generate suggestions mutation
    const { mutate: generateSuggestions, isPending } = useMutation({
        mutationFn: () => aiService.suggestSchedule(dateString),
        onSuccess: (data) => {
            setSuggestions(data);
            setCompletedTaskIds(new Set()); // Reset completed tasks on new generation
            message.success('Đã tạo gợi ý AI thành công!');
        },
        onError: () => {
            message.error('Không thể tạo gợi ý. Vui lòng thử lại.');
        },
    });

    const handleGenerate = useCallback(() => {
        generateSuggestions();
    }, [generateSuggestions]);

    // Mark task as done in database and remove from suggestions
    const handleCompleteTask = useCallback(async (taskId: string, taskTitle: string) => {
        setCompletingTaskId(taskId);
        try {
            await taskService.updateStatus(taskId, 'done');

            // Add to completed set (will be filtered out)
            setCompletedTaskIds(prev => {
                const newSet = new Set(prev);
                newSet.add(taskId);
                return newSet;
            });

            // Invalidate schedule queries to update calendar view
            queryClient.invalidateQueries({ queryKey: ['schedule'] });

            message.success(`Đã hoàn thành: "${taskTitle}"`);
        } catch (error) {
            message.error('Không thể cập nhật trạng thái task. Vui lòng thử lại.');
        } finally {
            setCompletingTaskId(null);
        }
    }, [queryClient]);

    // Filter out completed tasks from display
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
                            <Tooltip title="Đánh dấu hoàn thành (cập nhật vào database)">
                                {isCompleting ? (
                                    <LoadingOutlined style={{ color: '#1890ff' }} />
                                ) : (
                                    <Checkbox
                                        checked={false}
                                        onChange={() => handleCompleteTask(suggestion.taskId, suggestion.taskTitle)}
                                        disabled={isCompleting}
                                    />
                                )}
                            </Tooltip>
                        </div>
                        <div className="suggestion-order">
                            <span className="order-number">{suggestion.order}</span>
                        </div>
                        <div className="suggestion-details">
                            <div className="suggestion-title-row">
                                <Text strong className="task-title">{suggestion.taskTitle}</Text>
                                <Tag color={priorityColors[suggestion.priority]} style={{ marginLeft: 8 }}>
                                    {priorityLabels[suggestion.priority]}
                                </Tag>
                            </div>
                            <div className="suggestion-meta">
                                <Tooltip title="Thời gian gợi ý bắt đầu">
                                    <Tag icon={<ClockCircleOutlined />} color="blue">
                                        {suggestion.suggestedStartTime}
                                    </Tag>
                                </Tooltip>
                            </div>
                            <div className="suggestion-reason">
                                <BulbOutlined style={{ color: '#faad14', marginRight: 6 }} />
                                <Text type="secondary">{suggestion.reason}</Text>
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
                className="ai-suggestion-card collapsed"
                onClick={() => setExpanded(true)}
            >
                <Space>
                    <RobotOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                    <Text strong>🤖 Gợi ý từ AI</Text>
                    <Text type="secondary">- Click để mở rộng</Text>
                    {hasGenerated && visibleSuggestions.length > 0 && (
                        <Tag color="blue">{visibleSuggestions.length} task</Tag>
                    )}
                </Space>
            </Card>
        );
    }

    return (
        <Card
            className="ai-suggestion-card"
            title={
                <Space>
                    <RobotOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                    <Title level={5} style={{ margin: 0 }}>Gợi ý lịch làm việc hôm nay</Title>
                </Space>
            }
            extra={
                <Space>
                    <Button
                        type={hasGenerated ? 'default' : 'primary'}
                        icon={isPending ? <ReloadOutlined spin /> : <ThunderboltOutlined />}
                        onClick={handleGenerate}
                        disabled={isPending}
                        size="small"
                    >
                        {hasGenerated ? 'Tạo gợi ý mới' : 'Tạo gợi ý'}
                    </Button>
                    <Button size="small" onClick={() => setExpanded(false)}>
                        Thu gọn
                    </Button>
                </Space>
            }
        >
            <Spin spinning={isPending} tip="AI đang phân tích...">
                {!hasGenerated ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <RobotOutlined style={{ fontSize: 48, color: '#bfbfbf', marginBottom: 16 }} />
                        <div>
                            <Text type="secondary">
                                Nhấn <Text strong>"Tạo gợi ý"</Text> để AI phân tích và đề xuất lịch làm việc tối ưu cho bạn.
                            </Text>
                        </div>
                    </div>
                ) : suggestions ? (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {/* Summary */}
                        {suggestions.summary && (
                            <Alert
                                type="info"
                                message={suggestions.summary}
                                showIcon
                                icon={<BulbOutlined />}
                                className="ai-summary"
                            />
                        )}

                        {/* Completed count */}
                        {completedTaskIds.size > 0 && (
                            <Alert
                                type="success"
                                message={`Bạn đã hoàn thành ${completedTaskIds.size} task! Còn ${visibleSuggestions.length} task cần làm.`}
                                showIcon
                            />
                        )}

                        {/* Warnings */}
                        {suggestions.warnings && suggestions.warnings.length > 0 && (
                            <div className="ai-warnings">
                                {suggestions.warnings.map((warning, index) => (
                                    <Alert
                                        key={index}
                                        type="warning"
                                        message={warning}
                                        showIcon
                                        icon={<WarningOutlined />}
                                        style={{ marginBottom: 8 }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Suggestions List */}
                        {visibleSuggestions.length > 0 ? (
                            <List
                                className="ai-suggestions-list"
                                dataSource={visibleSuggestions}
                                renderItem={renderSuggestionItem}
                                split={false}
                            />
                        ) : (
                            <Empty
                                description={
                                    completedTaskIds.size > 0
                                        ? "🎉 Tuyệt vời! Bạn đã hoàn thành tất cả task được gợi ý!"
                                        : "Không có task nào cần làm hôm nay. Hãy nghỉ ngơi hoặc làm trước các task sắp tới!"
                                }
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Space>
                ) : null}
            </Spin>
        </Card>
    );
}
