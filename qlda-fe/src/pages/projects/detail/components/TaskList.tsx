import { useState } from 'react';
import { Space, message } from 'antd';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
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

  const sensors = useSensors(useSensor(PointerSensor));
  const qc = useQueryClient();
  const [tasks, setTasks] = useState<Task[]>(column.tasks || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [openTask, setOpenTask] = useState<Task | null>(null);

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
    qc.invalidateQueries({ queryKey: ['columns', projectId] });
    setTasks(prev => [...prev, { id: 'new', title: trimmed, columnId: column.id, status: 'todo', priority: 'low' }]);
  };

  const handleTaskDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  
    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);
  
    if (oldIndex === -1 || newIndex === -1) return;
  
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    setTasks(reordered);
  
    // Lấy 2 task lân cận vị trí mới
    const prevTask = reordered[newIndex - 1];
    const nextTask = reordered[newIndex + 1];
  
    try {
      await taskService.updatePosition(
        active.id as string,
        prevTask?.id,
        nextTask?.id,
        column.id // nếu sau này có drag sang cột khác
      );
    } catch {
      message.error('Không thể lưu vị trí');
    }
  };
  
  

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleTaskDragEnd}
      >
        <SortableContext items={tasks} strategy={rectSortingStrategy}>
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
      </DndContext>
      <TaskDetailModal open={!!openTask} task={openTask} onClose={() => setOpenTask(null)} />
    </>
  );
}
