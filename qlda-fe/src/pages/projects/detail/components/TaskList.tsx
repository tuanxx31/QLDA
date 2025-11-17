import { useState } from 'react';
import { Space } from 'antd';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { Column } from '@/types/project-board';
import type { Task } from '@/types/task.type';
import SortableTask from './SortableTask';
import TaskDetailModal from './TaskDetailModal';

export default function TaskList({ column }: { column: Column }) {
  const [openTask, setOpenTask] = useState<Task | null>(null);

  
  const tasks = column.tasks || [];
  const taskIds = tasks.map(t => t.id);

  return (
    <>
      <div style={{ flex: 1, minHeight: 0 }}>
        <SortableContext items={taskIds} strategy={rectSortingStrategy}>
          <Space
            direction="vertical"
            style={{ width: '100%', gap: 8 }}
          >
            {tasks.map(task => (
              <SortableTask
                key={task.id}
                task={task}
                onClick={setOpenTask}
              />
            ))}
          </Space>
        </SortableContext>
      </div>

      <TaskDetailModal
        open={!!openTask}
        task={openTask}
        onClose={() => setOpenTask(null)}
      />
    </>
  );
}
