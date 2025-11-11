import { PageContainer } from '@ant-design/pro-components';
import { Button, Space, Typography, message, Spin, Card, theme, Tooltip } from 'antd';
import { ArrowLeftOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { columnService } from '@/services/column.services';
import { taskService } from '@/services/task.services';
import type { Column } from '@/types/project-board';
import type { Task } from '@/types/task.type';
import AddColumnCard from './components/AddColumnCard';
import SortableColumn from './components/SortableColumn';
import { debounce } from 'lodash';

const { Title, Text } = Typography;

export default function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const queryClient = useQueryClient();

  const [columns, setColumns] = useState<Column[]>([]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const { data, isLoading } = useQuery({
    queryKey: ['columns', projectId],
    queryFn: () => columnService.getColumns(projectId!),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data?.data) {
      const sorted = [...data.data].sort((a, b) => a.order - b.order);
      setColumns(sorted);
    }
  }, [data]);

  const addColumn = useMutation({
    mutationFn: (name: string) => columnService.create(projectId!, { name }),
    onSuccess: res => {
      message.success('Đã thêm cột');
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
      setColumns(prev => [...prev, { ...res.data, order: prev.length + 1, tasks: [] }]);
      setIsAddingColumn(false);
      setNewColumnName('');
    },
  });

  const debouncedUpdateOrder = useRef(
    debounce(async (reordered: Column[]) => {
      try {
        await Promise.all(
          reordered.map((c, i) => columnService.update(projectId!, c.id, { order: i + 1 })),
        );
      } catch {
        message.error('Không thể lưu thứ tự cột');
      }
    }, 500),
  ).current;

  // ====== Xử lý kéo cột ======
  const handleColumnDragStart = (event: DragStartEvent) => {
    const activeCol = columns.find(c => c.id === event.active.id);
    if (activeCol) setActiveColumn(activeCol);
  };

  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveColumn(null);
      return;
    }

    const oldIndex = columns.findIndex(c => c.id === active.id);
    const newIndex = columns.findIndex(c => c.id === over.id);
    const reordered = arrayMove(columns, oldIndex, newIndex).map((c, i) => ({
      ...c,
      order: i + 1,
    }));

    setColumns(reordered);
    debouncedUpdateOrder(reordered);
    setActiveColumn(null);
  };

  // ====== Xử lý kéo task ======
  const findColumnByTaskId = (cols: Column[], taskId: string) =>
    cols.find(col => col.tasks?.some(t => t.id === taskId));

  const findTaskIndex = (tasks: Task[], id: string) => tasks.findIndex(t => t.id === id);

  const handleTaskDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = columns.flatMap(col => col.tasks ?? []).find(t => t.id === active.id);
    if (found) setActiveTask(found);
  };

  // ⏳ Drag qua cột khác (update UI tạm)
  const handleTaskDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
  
    const activeId = String(active.id);
    const overId = String(over.id);
  
    setColumns(cols => {
      const fromCol = findColumnByTaskId(cols, activeId);
      const toCol =
        findColumnByTaskId(cols, overId) || cols.find(c => c.id === overId);
      if (!fromCol || !toCol || fromCol.id === toCol.id) return cols;
  
      const fromTasks = [...(fromCol.tasks ?? [])];
      const toTasks = [...(toCol.tasks ?? [])];
      const fromIndex = findTaskIndex(fromTasks, activeId);
      const overIndex =
        overId === toCol.id ? toTasks.length : findTaskIndex(toTasks, overId);
  
      const [moved] = fromTasks.splice(fromIndex, 1);
      moved.columnId = toCol.id;
      toTasks.splice(overIndex, 0, moved);
  
      return cols.map(col => {
        if (col.id === fromCol.id) return { ...col, tasks: fromTasks };
        if (col.id === toCol.id) return { ...col, tasks: toTasks };
        return col;
      });
    });
  };
  

  // ✅ Thả task (lưu server)
  const handleTaskDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const fromCol = findColumnByTaskId(columns, activeId);
    const toCol = findColumnByTaskId(columns, overId) || columns.find(c => c.id === overId);

    if (!fromCol || !toCol) return;

    const fromTasks = [...(fromCol.tasks ?? [])];
    const toTasks = [...(toCol.tasks ?? [])];
    const fromIndex = findTaskIndex(fromTasks, activeId);
    const overIndex = overId === toCol.id ? toTasks.length : findTaskIndex(toTasks, overId);

    const [moved] = fromTasks.splice(fromIndex, 1);
    moved.columnId = toCol.id;
    toTasks.splice(overIndex, 0, moved);

    // Cập nhật UI tạm
    setColumns(cols =>
      cols.map(col => {
        if (col.id === fromCol.id) return { ...col, tasks: fromTasks };
        if (col.id === toCol.id) return { ...col, tasks: toTasks };
        return col;
      }),
    );

    // 🧩 Gửi prev/next task cho API
    const prevTask = toTasks[overIndex - 1];
    const nextTask = toTasks[overIndex + 1];

    try {
      await taskService.updatePosition(moved.id, prevTask?.id, nextTask?.id, toCol.id);
      message.success('Đã cập nhật vị trí nhiệm vụ');
    } catch (err) {
      console.error(err);
      message.error('Không thể lưu vị trí nhiệm vụ');
    } finally {
      await queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
    }
  };

  // ====== Toàn màn hình ======
  useEffect(() => {
    const handleChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        message.error('Không thể bật toàn màn hình');
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/projects/${projectId}`)}
          />
          <Title level={4} style={{ margin: 0 }}>
            Bảng công việc
          </Title>
        </Space>
      }
      extra={[
        <Tooltip title={isFullScreen ? 'Thoát toàn màn hình (Esc)' : 'Toàn màn hình'} key="fs">
          <Button
            type="text"
            icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullScreen}
          />
        </Tooltip>,
      ]}
    >
      <Card
        style={{
          height: 'calc(100vh - 200px)',
          display: 'flex',
          flexDirection: 'column',
        }}
        bodyStyle={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={event => {
            handleTaskDragStart(event);
            handleColumnDragStart(event);
          }}
          onDragOver={handleTaskDragOver}
          onDragEnd={event => {
            handleTaskDragEnd(event);
            handleColumnDragEnd(event);
          }}
        >
          <SortableContext items={columns.map(c => c.id)} strategy={rectSortingStrategy}>
            <Space
              align="start"
              style={{
                width: '100%',
                overflowX: 'auto',
                padding: 8,
                height: '100%',
              }}
            >
              {columns.map(col => (
                <div
                  key={col.id}
                  style={{
                    opacity: activeColumn?.id === col.id ? 0 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <SortableColumn column={col} />
                </div>
              ))}

              <AddColumnCard
                isAdding={isAddingColumn}
                setIsAdding={setIsAddingColumn}
                newName={newColumnName}
                setNewName={setNewColumnName}
                onAdd={name => addColumn.mutate(name)}
              />
            </Space>
          </SortableContext>

          {/* ✅ Overlay đẹp cho cả cột và task */}
          <DragOverlay>
            {activeColumn ? (
              <div
                style={{
                  transform: 'rotate(1deg)',
                  boxShadow: token.boxShadowSecondary,
                  opacity: 0.95,
                }}
              >
                <SortableColumn column={activeColumn} isOverlay />
              </div>
            ) : activeTask ? (
              <Card
                size="small"
                bordered
                style={{
                  width: 260,
                  borderRadius: 8,
                  background: token.colorBgContainer,
                  boxShadow: token.boxShadowSecondary,
                  transform: 'rotate(1deg)',
                  opacity: 0.95,
                }}
              >
                <Typography.Text strong style={{ display: 'block' }}>
                  {activeTask.title}
                </Typography.Text>
                {activeTask.description && (
                  <Typography.Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ marginBottom: 0 }}
                  >
                    {activeTask.description}
                  </Typography.Paragraph>
                )}
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Card>
    </PageContainer>
  );
}
