import { Space } from 'antd';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import type { Column, Task } from '@/types/project-board';
import SortableTask from './SortableTask';

export default function TaskList({ column }: { column: Column }) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [tasks, setTasks] = useState<Task[]>(column.tasks || []);

  const handleTaskDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);
    setTasks(arrayMove(tasks, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTaskDragEnd}>
      <SortableContext items={tasks} strategy={rectSortingStrategy}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {tasks.map(task => (
            <SortableTask key={task.id} task={task} />
          ))}
        </Space>
      </SortableContext>
    </DndContext>
  );
}
