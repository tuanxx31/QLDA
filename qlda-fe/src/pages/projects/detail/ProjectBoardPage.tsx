import { PageContainer } from '@ant-design/pro-components';
import { Button, Space, Typography, message, Spin, Card, theme, Tooltip } from 'antd';
import { ArrowLeftOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
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
  KeyboardSensor,
  type DragMoveEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
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
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
          c.tasks = [...c.tasks].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
      });
      setColumns(sorted);
    }
  }, [data]);

  const getColumnOf = (id: string, cols: Column[]) => {
    // id là column
    const direct = cols.find(c => c.id === id);
    if (direct) return direct;

    // id là task
    return cols.find(c => c.tasks?.some(t => t.id === id));
  };

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

    // Với task: ưu tiên pointerWithin để phát hiện khi hover vào task/column cụ thể
    // Sau đó dùng rectIntersection và closestCenter làm fallback
    if (activeType === 'task') {
      // Ưu tiên pointerWithin để phát hiện chính xác khi hover vào task hoặc column
      const pointerCollisions = pointerWithin(args);
      if (pointerCollisions.length > 0) {
        // Kiểm tra xem có collision với column không (quan trọng cho column rỗng)
        const columnCollision = pointerCollisions.find(c => c.data?.current?.type === 'column');
        if (columnCollision) return [columnCollision];
        return pointerCollisions;
      }

      // Fallback: dùng rectIntersection để phát hiện collision với các element
      const rectCollisions = rectIntersection(args);
      if (rectCollisions.length > 0) {
        // Ưu tiên column nếu có
        const columnCollision = rectCollisions.find(c => c.data?.current?.type === 'column');
        if (columnCollision) return [columnCollision];
        return rectCollisions;
      }

      // Cuối cùng dùng closestCenter
      return closestCenter(args);
    }

    // Với column: dùng closestCenter để sắp xếp theo vị trí trung tâm
    if (activeType === 'column') {
      return closestCenter(args);
    }

    // Fallback mặc định
    return rectIntersection(args);
  };

  const findColumnByTaskId = (taskId: string, cols: Column[] = columns) =>
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

    const activeId = String(active.id);
    const overId = String(over.id);

    if (active.data?.current?.type !== 'task') return;

    setColumns(prev => {
      const draft = JSON.parse(JSON.stringify(prev)) as Column[];

      const fromCol = getColumnOf(activeId, draft);
      const toCol = getColumnOf(overId, draft);

      if (!fromCol || !toCol) return prev;

      // Cùng cột
      if (fromCol.id === toCol.id) {
        const tasks = fromCol.tasks ?? [];
        const fromIdx = tasks.findIndex(t => t.id === activeId);
        const overIdx = tasks.findIndex(t => t.id === overId);

        if (fromIdx === -1 || overIdx === -1) return prev;

        fromCol.tasks = arrayMove(tasks, fromIdx, overIdx);
        return [...draft];
      }

      // Khác cột
      const fromTasks = fromCol.tasks ?? [];
      const toTasks = toCol.tasks ?? [];

      const fromIdx = fromTasks.findIndex(t => t.id === activeId);
      if (fromIdx === -1) return prev;

      const [moved] = fromTasks.splice(fromIdx, 1);

      let overIdx = toTasks.findIndex(t => t.id === overId);
      if (overIdx === -1) overIdx = toTasks.length;

      toTasks.splice(overIdx, 0, moved);

      fromCol.tasks = fromTasks;
      toCol.tasks = toTasks;

      return [...draft];
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveTask(null);
      setActiveColumn(null);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const type = active.data?.current?.type;

    // ===== DRAG COLUMN =====
    if (type === 'column') {
      setColumns(prev => {
        const oldIdx = prev.findIndex(c => c.id === activeId);
        const newIdx = prev.findIndex(c => c.id === overId);
        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return prev;

        const reordered = arrayMove(prev, oldIdx, newIdx).map((c, i) => ({
          ...c,
          order: i + 1,
        }));

        debouncedUpdateOrder(reordered);
        return reordered;
      });

      setActiveColumn(null);
      return;
    }

    // ===== DRAG TASK =====
    setColumns(prev => {
      const draft = JSON.parse(JSON.stringify(prev)) as Column[];

      const fromCol = getColumnOf(activeId, draft);
      const toCol = getColumnOf(overId, draft);

      if (!fromCol || !toCol) return prev;

      const fromTasks = fromCol.tasks ?? [];
      const toTasks = toCol.tasks ?? [];

      const fromIdx = fromTasks.findIndex(t => t.id === activeId);
      if (fromIdx === -1) return prev;

      const [moved] = fromTasks.splice(fromIdx, 1);
      moved.columnId = toCol.id;

      let overIdx = -1;

      // CASE 1: Drop lên 1 task
      if (over.data?.current?.type === 'task') {
        overIdx = toTasks.findIndex(t => t.id === overId);
      }

      // CASE 2: Drop vào column
      else if (over.data?.current?.type === 'column') {
        // column rỗng
        if (toTasks.length === 0) overIdx = 0;
        // column có task → chèn cuối
        else overIdx = toTasks.length;
      }

      // fallback
      if (overIdx === -1) overIdx = toTasks.length;

      toTasks.splice(overIdx, 0, moved);

      const prevTask = toTasks[overIdx - 1];
      const nextTask = toTasks[overIdx + 1];
      console.log('overIdx', overIdx);
      console.log('toTasks', toTasks);
      console.log({prevTask}, {nextTask});
      taskService.updatePosition(moved.id, prevTask?.id, nextTask?.id, toCol.id).catch(() => {
        message.error('Không thể lưu vị trí nhiệm vụ');
        queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
      });

      fromCol.tasks = fromTasks;
      toCol.tasks = toTasks;

      return [...draft];
    });

    setActiveTask(null);
    setActiveColumn(null);
  };

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleDragMove = (event: DragMoveEvent) => {
    const { activatorEvent } = event;
    if (!('clientX' in activatorEvent)) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const { clientX } = activatorEvent;

    const threshold = 80;
    const speed = 20;

    if (clientX < rect.left + threshold) {
      container.scrollLeft -= speed;
    } else if (clientX > rect.right - threshold) {
      container.scrollLeft += speed;
    }
  };

  useEffect(() => {
    const handle = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handle);
    return () => document.removeEventListener('fullscreenchange', handle);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement)
      document.documentElement
        .requestFullscreen()
        .catch(() => message.error('Không thể bật fullscreen'));
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
          collisionDetection={closestCenter} // có thể giữ như cũ hoặc rectIntersection
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
        >
          <SortableContext items={columnIds} strategy={rectSortingStrategy}>
            <Space
              align="start"
              style={{ overflowX: 'auto', padding: 8, flex: 1 }}
              ref={scrollContainerRef}
            >
              {columns.map(col => (
                <SortableColumn key={col.id} column={col} />
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
                  opacity: 0.9,
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
