import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Space,
  Typography,
  message,
  Spin,
  Card,
  theme,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  closestCenter,
  rectIntersection,
  pointerWithin,
  type CollisionDetection,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { columnService } from '@/services/column.services';
import { taskService } from '@/services/task.services';
import type { Column } from '@/types/project-board';
import type { Task } from '@/types/task.type';
import AddColumnCard from './components/AddColumnCard';
import SortableColumn from './components/SortableColumn';
import { debounce } from 'lodash';

const { Title } = Typography;

export default function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token } = theme.useToken();

  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  
  const { data, isLoading } = useQuery({
    queryKey: ['columns', projectId],
    queryFn: () => columnService.getColumns(projectId!),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (data?.data) {
      const sorted = [...data.data].sort((a, b) => a.order - b.order);
      sorted.forEach(c => {
        if (c.tasks?.length)
          c.tasks = [...c.tasks].sort(
            (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
          );
      });
      setColumns(sorted);
    }
  }, [data]);

  const addColumn = useMutation({
    mutationFn: (name: string) => columnService.create(projectId!, { name }),
    onSuccess: res => {
      message.success('Đã thêm cột');
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
      setColumns(prev => [
        ...prev,
        { ...res.data, order: prev.length + 1, tasks: [] },
      ]);
      setIsAddingColumn(false);
      setNewColumnName('');
    },
  });

  const debouncedUpdateOrder = useRef(
    debounce(async (cols: Column[]) => {
      try {
        await Promise.all(
          cols.map((c, i) => columnService.update(projectId!, c.id, { order: i + 1 })),
        );
      } catch {
        message.error('Không thể lưu thứ tự cột');
      }
    }, 400),
  ).current;

  const collisionDetection: CollisionDetection = args => {
    const activeType = args.active?.data?.current?.type;
    if (activeType === 'task') {
      return pointerWithin(args) || rectIntersection(args) || closestCenter(args);
    }
    if (activeType === 'column') {
      return closestCenter(args);
    }
    return rectIntersection(args);
  };

  const findColumnByTaskId = (taskId: string, cols = columns) =>
    cols.find(col => col.tasks?.some(t => t.id === taskId));

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data?.current?.type;
    if (type === 'column') {
      const col = columns.find(c => c.id === event.active.id);
      if (col) setActiveColumn(col);
    }
    if (type === 'task') {
      const t = columns.flatMap(c => c.tasks ?? []).find(t => t.id === event.active.id);
      if (t) setActiveTask(t);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeType = active.data?.current?.type;
    if (activeType !== 'task') return;

    const activeId = String(active.id);
    const overId = String(over.id);

    setColumns(prev => {
      const fromCol = findColumnByTaskId(activeId, prev);
      const toCol = findColumnByTaskId(overId, prev) || prev.find(c => c.id === overId);
      if (!fromCol || !toCol || fromCol.id === toCol.id) return prev;

      const fromTasks = [...(fromCol.tasks ?? [])];
      const toTasks = [...(toCol.tasks ?? [])];
      const fromIdx = fromTasks.findIndex(t => t.id === activeId);
      if (fromIdx < 0) return prev;

      const overIdx =
        overId === toCol.id
          ? toTasks.length
          : Math.max(0, toTasks.findIndex(t => t.id === overId));
      const [moved] = fromTasks.splice(fromIdx, 1);
      moved.columnId = toCol.id;
      toTasks.splice(overIdx < 0 ? toTasks.length : overIdx, 0, moved);

      return prev.map(c =>
        c.id === fromCol.id
          ? { ...c, tasks: fromTasks }
          : c.id === toCol.id
          ? { ...c, tasks: toTasks }
          : c,
      );
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveTask(null);
      setActiveColumn(null);
      return;
    }

    const type = active.data?.current?.type;

    if (type === 'column') {
      const oldIdx = columns.findIndex(c => c.id === active.id);
      const newIdx = columns.findIndex(c => c.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = arrayMove(columns, oldIdx, newIdx).map((c, i) => ({
        ...c,
        order: i + 1,
      }));
      setColumns(reordered);
      debouncedUpdateOrder(reordered);
      setActiveColumn(null);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const fromCol = findColumnByTaskId(activeId);
    const toCol = findColumnByTaskId(overId) || columns.find(c => c.id === overId);
    if (!fromCol || !toCol) return;

    const fromTasks = [...(fromCol.tasks ?? [])];
    const toTasks = [...(toCol.tasks ?? [])];
    const fromIdx = fromTasks.findIndex(t => t.id === activeId);
    const [moved] = fromTasks.splice(fromIdx, 1);

    const overIdx =
      overId === toCol.id
        ? toTasks.length
        : Math.max(0, toTasks.findIndex(t => t.id === overId));
    toTasks.splice(overIdx, 0, moved);
    moved.columnId = toCol.id;

    setColumns(cols =>
      cols.map(c =>
        c.id === fromCol.id
          ? { ...c, tasks: fromTasks }
          : c.id === toCol.id
          ? { ...c, tasks: toTasks }
          : c,
      ),
    );

    const prevTask = toTasks[overIdx - 1];
    const nextTask = toTasks[overIdx + 1];
    try {
      await taskService.updatePosition(moved.id, prevTask?.id, nextTask?.id, toCol.id);
    } catch {
      message.error('Không thể lưu vị trí nhiệm vụ');
    } finally {
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
      setActiveTask(null);
    }
  };

  useEffect(() => {
    const handle = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handle);
    return () => document.removeEventListener('fullscreenchange', handle);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen().catch(() => message.error('Không thể bật fullscreen'));
    else document.exitFullscreen();
  };

  const columnIds = useMemo(() => columns.map(c => c.id), [columns]);

  if (isLoading)
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );

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
        <Tooltip title={isFullScreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'} key="fs">
          <Button
            type="text"
            icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullScreen}
          />
        </Tooltip>,
      ]}
    >
      <Card
        style={{ height: 'calc(100vh - 200px)', display: 'flex' }}
        bodyStyle={{ padding: 0, flex: 1 }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={columnIds} strategy={rectSortingStrategy}>
            <Space align="start" style={{ overflowX: 'auto', padding: 8, flex: 1 }}>
              {columns.map(col => (
                <div
                  key={col.id}
                  style={{
                    opacity: activeColumn?.id === col.id ? 0.3 : 1,
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

          <DragOverlay>
            {activeColumn && <SortableColumn column={activeColumn} isOverlay />}
            {activeTask && (
              <Card
                size="small"
                bordered
                style={{
                  width: 260,
                  borderRadius: 8,
                  background: token.colorBgContainer,
                  boxShadow: token.boxShadowSecondary,
                }}
              >
                <Typography.Text strong>{activeTask.title}</Typography.Text>
              </Card>
            )}
          </DragOverlay>
        </DndContext>
      </Card>
    </PageContainer>
  );
}
