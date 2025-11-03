import { PageContainer } from '@ant-design/pro-components';
import { Button, Space, Typography, message, Spin, Card, theme } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { columnService } from '@/services/column.services';
import type { Column, Task } from '@/types/project-board';
import AddColumnCard from './components/AddColumnCard';
import SortableColumn from './components/SortableColumn';
import { debounce } from 'lodash';

const { Title, Text } = Typography;

export default function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const [columns, setColumns] = useState<Column[]>([]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const { data, isLoading } = useQuery({
    queryKey: ['columns', projectId],
    queryFn: () => columnService.getColumns(projectId!),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  // --- Load initial columns
  useEffect(() => {
    if (data?.data) {
      const sorted = [...data.data].sort((a, b) => a.order - b.order);
      setColumns(sorted);
    }
  }, [data]);

  // --- Add column mutation
  const addColumn = useMutation({
    mutationFn: (name: string) => columnService.create(projectId!, { name }),
    onSuccess: (res) => {
      message.success('Đã thêm cột');
      setColumns(prev => [
        ...prev,
        { ...res.data, order: prev.length + 1, tasks: [] },
      ]);
      setIsAddingColumn(false);
      setNewColumnName('');
    },
  });

  // --- Debounced update order
  const debouncedUpdateOrder = useRef(
    debounce(async (reordered: Column[]) => {
      try {
        await Promise.all(
          reordered.map((c, i) =>
            columnService.update(projectId!, c.id, { order: i + 1 }),
          ),
        );
      } catch {
        message.error('Không thể lưu thứ tự cột');
      }
    }, 500),
  ).current;

  // --- Khi bắt đầu kéo cột
  const handleColumnDragStart = (event: DragStartEvent) => {
    const activeCol = columns.find(c => c.id === event.active.id);
    if (activeCol) setActiveColumn(activeCol);
  };

  // --- Khi kết thúc kéo cột
  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveColumn(null);
      return;
    }

    const oldIndex = columns.findIndex(c => c.id === active.id);
    const newIndex = columns.findIndex(c => c.id === over.id);
    const reordered = arrayMove(columns, oldIndex, newIndex)
      .map((c, i) => ({ ...c, order: i + 1 }));

    // Cập nhật client ngay
    setColumns(reordered);
    // Gửi API cập nhật thứ tự
    debouncedUpdateOrder(reordered);
    setActiveColumn(null);
  };

  // --- Task drag giữ nguyên
  const handleTaskDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = columns.flatMap(col => col.tasks ?? []).find(t => t.id === active.id);
    if (found) setActiveTask(found);
  };

  const handleTaskDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeCol = columns.find(col => col.tasks?.some(t => t.id === active.id));
    const overCol = columns.find(col => col.tasks?.some(t => t.id === over.id));

    if (!activeCol || !overCol) return;

    const activeTasks = [...(activeCol.tasks ?? [])];
    const overTasks = [...(overCol.tasks ?? [])];

    const activeIndex = activeTasks.findIndex(t => t.id === active.id);
    const overIndex = overTasks.findIndex(t => t.id === over.id);

    const [movedTask] = activeTasks.splice(activeIndex, 1);

    if (activeCol.id === overCol.id) {
      activeTasks.splice(overIndex, 0, movedTask);
      setColumns(cols =>
        cols.map(col =>
          col.id === activeCol.id ? { ...col, tasks: activeTasks } : col,
        ),
      );
    } else {
      overTasks.splice(overIndex, 0, movedTask);
      setColumns(cols =>
        cols.map(col => {
          if (col.id === activeCol.id) return { ...col, tasks: activeTasks };
          if (col.id === overCol.id) return { ...col, tasks: overTasks };
          return col;
        }),
      );
    }

    setActiveTask(null);
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
    >
      <Card style={{ minHeight: '82vh' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => {
            handleTaskDragStart(event);
            handleColumnDragStart(event);
          }}
          onDragEnd={(event) => {
            handleTaskDragEnd(event);
            handleColumnDragEnd(event);
          }}
        >
          <SortableContext items={columns} strategy={rectSortingStrategy}>
            <Space
              align="start"
              style={{
                width: '100%',
                minHeight: '100%',
                overflowX: 'auto',
                padding: 8,
              }}
            >
              {columns.map(col => (
                <div
                  key={col.id}
                  style={{
                    opacity: activeColumn?.id === col.id ? 0 : 1, // ẩn cột đang kéo
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
  {activeColumn ? (
    <div
      style={{
        transform: 'rotate(1deg)', // tạo cảm giác "đang cầm"
        boxShadow: token.boxShadowSecondary,
        opacity: 0.95,
      }}
    >
      <SortableColumn
        column={activeColumn}
        isOverlay // 👈 truyền flag đặc biệt
      />
    </div>
  ) : activeTask ? (
    <Card
      style={{
        borderRadius: 8,
        background: token.colorBgElevated,
        boxShadow: token.boxShadowSecondary,
        width: 250,
      }}
    >
      <Typography.Text strong>{activeTask.title}</Typography.Text>
      <br />
      <Text type="secondary">{activeTask.description || 'Không có mô tả'}</Text>
    </Card>
  ) : null}
</DragOverlay>

        </DndContext>
      </Card>
    </PageContainer>
  );
}
