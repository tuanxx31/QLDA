import { useState } from 'react';
import { Space, message } from 'antd';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { Column } from '@/types/project-board';
import type { Task } from '@/types/task.type';
import SortableTask from './SortableTask';
import AddTaskCard from './AddTaskCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.services';
import { useParams } from 'react-router-dom';
import TaskDetailModal from './TaskDetailModal';

export default function TaskList({ column }: { column: Column }) {
  const { projectId } = useParams<{ projectId: string }>();

  const qc = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [openTask, setOpenTask] = useState<Task | null>(null);

  // Đồng bộ tasks từ column prop thay vì dùng local state
  const tasks = column.tasks || [];

  const addTask = useMutation({
    mutationFn: (title: string) => taskService.create(column.id, title),
    onSuccess: async () => {
      message.success('Đã thêm thẻ');
      setIsAdding(false);
      setNewTitle('');
      await qc.invalidateQueries({ queryKey: ['columns', projectId] });
    },
    onError: () => message.error('Không thể thêm thẻ'),
  });

  const handleAdd = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) {
      message.warning('Tên thẻ không được để trống');
      return;
    }
    addTask.mutate(trimmed);
  };

  const taskIds = tasks.map(t => t.id);

  return (
    <>
      <SortableContext items={taskIds} strategy={rectSortingStrategy}>
        <Space direction="vertical" style={{ width: '100%', gap: 8, paddingBottom: 8 }}>
          {tasks.map(task => (
            <SortableTask key={task.id} task={task} onClick={setOpenTask} />
          ))}

          <AddTaskCard
            isAdding={isAdding}
            setIsAdding={setIsAdding}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            onAdd={handleAdd}
            loading={addTask.isPending}
          />
        </Space>
      </SortableContext>
      <TaskDetailModal open={!!openTask} task={openTask} onClose={() => setOpenTask(null)} />
    </>
  );
}
