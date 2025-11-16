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
  type DragEndEvent,
  type DragMoveEvent,
  KeyboardSensor,
  closestCorners,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
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

  // Lưu lại columnId gốc của task khi bắt đầu kéo
  const [dragTaskFromColumnId, setDragTaskFromColumnId] = useState<string | null>(null);

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
        if (c.tasks?.length) {
          c.tasks = [...c.tasks].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
        }
      });
      setColumns(sorted);
    }
  }, [data]);

  // Tìm column theo id column / id task (giống findValueOfItems của bạn)
  const findColumnById = (colId: string, cols: Column[]) => cols.find(c => c.id === colId);

  const findColumnOfTask = (taskId: string, cols: Column[]) =>
    cols.find(c => c.tasks?.some(t => t.id === taskId));

  const getColumnOf = (id: string, type: 'column' | 'task', cols: Column[]): Column | undefined => {
    if (type === 'column') {
      return findColumnById(id, cols);
    }
    return findColumnOfTask(id, cols);
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

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data?.current?.type;
    const activeId = String(event.active.id);

    if (type === 'column') {
      const col = columns.find(c => c.id === activeId);
      if (col) setActiveColumn(col);
    }

    if (type === 'task') {
      const t = columns.flatMap(c => c.tasks ?? []).find(t => t.id === activeId);
      if (t) setActiveTask(t);

      const fromCol = findColumnOfTask(activeId, columns);
      setDragTaskFromColumnId(fromCol?.id ?? null);
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Giống demo: move task trong handleDragMove
  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over, activatorEvent } = event;
    if (!over) return;

    const activeType = active.data?.current?.type;
    const overType = over.data?.current?.type;

    const activeId = String(active.id);
    const overId = String(over.id);

    // ===== MOVE TASK (giống logic demo Home.tsx) =====
    if (activeType === 'task' && over && active.id !== over.id) {
      setColumns(prev => {
        const draft = JSON.parse(JSON.stringify(prev)) as Column[];

        const activeCol = getColumnOf(activeId, 'task', draft);
        const overCol = getColumnOf(overId, overType === 'task' ? 'task' : 'column', draft);

        if (!activeCol || !overCol) return prev;

        const activeTasks = activeCol.tasks ?? [];
        const overTasks = overCol.tasks ?? [];

        const activeIndex = activeTasks.findIndex(t => t.id === activeId);
        if (activeIndex === -1) return prev;

        // Kéo lên 1 task
        if (overType === 'task') {
          const overIndex = overTasks.findIndex(t => t.id === overId);
          if (overIndex === -1) return prev;

          if (activeCol.id === overCol.id) {
            // cùng cột → arrayMove trong cùng column
            const newTasks = arrayMove(activeTasks, activeIndex, overIndex);
            activeCol.tasks = newTasks;
          } else {
            // khác cột → remove ở cột cũ, insert vào cột mới
            const [removed] = activeTasks.splice(activeIndex, 1);
            overTasks.splice(overIndex, 0, removed);
            removed.columnId = overCol.id;
            activeCol.tasks = activeTasks;
            overCol.tasks = overTasks;
          }
        }

        // Kéo lên container (column body)
        if (overType === 'column') {
          if (activeCol.id === overCol.id) {
            // cùng cột, kéo trong container → nếu muốn, có thể cho xuống cuối
            // ở đây tạm không đổi (kéo lên chính cột mình đang ở)
            return prev;
          }

          const [removed] = activeTasks.splice(activeIndex, 1);
          overTasks.push(removed);
          removed.columnId = overCol.id;
          activeCol.tasks = activeTasks;
          overCol.tasks = overTasks;
        }

        return [...draft];
      });
    }

    // ===== AUTO-SCROLL theo trục X =====
    // if (activatorEvent && 'clientX' in activatorEvent) {
    //   const container = scrollContainerRef.current;
    //   if (!container) return;

    //   const rect = container.getBoundingClientRect();
    //   const { clientX } = activatorEvent;
    //   const threshold = 80;
    //   const speed = 20;

    //   if (clientX < rect.left + threshold) {
    //     container.scrollLeft -= speed;
    //   } else if (clientX > rect.right - threshold) {
    //     container.scrollLeft += speed;
    //   }
    // }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      setActiveColumn(null);
      setDragTaskFromColumnId(null);
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
      const draft = [...prev]; // state sau khi handleDragMove đã cập nhật

      // Tìm column cuối cùng chứa task
      const finalCol = findColumnOfTask(activeId, draft);
      if (!finalCol) return prev;

      const tasks = finalCol.tasks ?? [];
      const index = tasks.findIndex(t => t.id === activeId);
      if (index === -1) return prev;

      const prevTask = tasks[index - 1];
      const nextTask = tasks[index + 1];

      const isSameColumn = dragTaskFromColumnId && dragTaskFromColumnId === finalCol.id;

      taskService
        .updatePosition(
          activeId,
          prevTask?.id,
          nextTask?.id,
          isSameColumn ? undefined : finalCol.id,
        )
        .catch(() => {
          message.error('Không thể lưu vị trí nhiệm vụ');
          queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
        });

      return draft;
    });

    setActiveTask(null);
    setActiveColumn(null);
    setDragTaskFromColumnId(null);
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
          collisionDetection={(args) => {
            const pointer = pointerWithin(args);
            if (pointer.length > 0) return pointer;
            return rectIntersection(args);
          }}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            <div
              ref={scrollContainerRef}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                overflowX: 'auto',
                padding: 8,
                flex: 1,
                flexShrink: 0,
              }}
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
            </div>
          </SortableContext>

          <DragOverlay adjustScale={false}>
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
