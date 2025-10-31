import { PageContainer } from '@ant-design/pro-components';
import { Button, Space, Typography, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { columnService } from '@/services/column.services';
import type { Column } from '@/types/project-board';
import AddColumnCard from './components/AddColumnCard';
import SortableColumn from './components/SortableColumn';

const { Title } = Typography;

export default function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [columns, setColumns] = useState<Column[]>([]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const sensors = useSensors(useSensor(PointerSensor));

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

  const addColumnMutation = useMutation({
    mutationFn: (name: string) => columnService.create(projectId!, { name }),
    onSuccess: async () => {
      message.success('Đã thêm cột');
      await qc.invalidateQueries({ queryKey: ['columns', projectId] });
      setIsAddingColumn(false);
      setNewColumnName('');
    },
  });

  const handleColumnDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = columns.findIndex(c => c.id === active.id);
    const newIndex = columns.findIndex(c => c.id === over.id);

    const reordered = arrayMove(columns, oldIndex, newIndex);
    setColumns(reordered);

    await Promise.all(reordered.map((c, i) => columnService.update(c.id, { order: i })));
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
        onDragEnd={handleColumnDragEnd}
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
              onAdd={name => addColumnMutation.mutate(name)}
            />
          </Space>
        </SortableContext>
      </DndContext>
    </PageContainer>
  );
}
