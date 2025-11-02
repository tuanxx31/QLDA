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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { columnService } from '@/services/column.services';
import type { Column, Task } from '@/types/project-board';
import AddColumnCard from './components/AddColumnCard';
import SortableColumn from './components/SortableColumn';

const { Title, Text } = Typography;

export default function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { token } = theme.useToken();

  const [columns, setColumns] = useState<Column[]>([]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));


  // 🔹 Lấy dữ liệu cột
  const { data, isLoading } = useQuery({
    queryKey: ['columns', projectId],
    queryFn: () => columnService.getColumns(projectId!),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (data?.data) {
      const sorted = [...data.data].sort((a, b) => a.order - b.order);
      setColumns(sorted);
    }
  }, [data]);

  // 🔹 Thêm cột
  const addColumn = useMutation({
    mutationFn: (name: string) => columnService.create(projectId!, { name }),
    onSuccess: async () => {
      message.success('Đã thêm cột');
      await qc.invalidateQueries({ queryKey: ['columns', projectId] });
      setIsAddingColumn(false);
      setNewColumnName('');
    },
  });

  // 🧱 Kéo-thả cột
  const handleColumnDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = columns.findIndex(c => c.id === active.id);
    const newIndex = columns.findIndex(c => c.id === over.id);
    const reordered = arrayMove(columns, oldIndex, newIndex);
    setColumns(reordered);

    await Promise.all(
      reordered.map((c, i) => columnService.update(projectId!, c.id, { order: i }))
    );
  };

  // 🔹 Khi bắt đầu kéo task
  const handleTaskDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = columns.flatMap(col => col.tasks ?? []).find(t => t.id === active.id);
    if (found) setActiveTask(found);
  };

  // 🔹 Khi thả task
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
      const updated = columns.map(col =>
        col.id === activeCol.id ? { ...col, tasks: activeTasks } : col,
      );
      setColumns(updated);
    } else {
      overTasks.splice(overIndex, 0, movedTask);
      const updated = columns.map(col => {
        if (col.id === activeCol.id) return { ...col, tasks: activeTasks };
        if (col.id === overCol.id) return { ...col, tasks: overTasks };
        return col;
      });
      setColumns(updated);
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleTaskDragStart}
        onDragEnd={event => {
          handleTaskDragEnd(event);
          handleColumnDragEnd(event);
        }}
      >
        <SortableContext items={columns} strategy={rectSortingStrategy}>
          <Space
            align="start"
            style={{
              width: '100%',
              overflowX: 'auto',
              padding: 8,
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
          </Space>
        </SortableContext>

        {/* 🔹 Preview khi kéo */}
        <DragOverlay>
          {activeTask ? (
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
    </PageContainer>
  );
}
