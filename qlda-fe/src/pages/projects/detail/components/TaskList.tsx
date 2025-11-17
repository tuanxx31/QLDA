import { useState, useCallback, useMemo } from 'react';
import { Space } from 'antd';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { Column } from '@/types/project-board';
import SortableTask from './SortableTask';
import TaskDetailModal from './TaskDetailModal';

export default function TaskList({ column }: { column: Column }) {
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  
  const tasks = column.tasks || [];
  const taskIds = tasks.map(t => t.id);

  const handleTaskClick = useCallback((taskId: string) => {
    console.log('taskId received in TaskList', taskId);
    setOpenTaskId(taskId);
  }, []);

  const openTask = useMemo(() => {
    if (!openTaskId) return null;
    const found = tasks.find(t => t.id === openTaskId);
    console.log('openTask found:', found?.id, 'for openTaskId:', openTaskId);
    return found || null;
  }, [tasks, openTaskId]);

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
                onClick={handleTaskClick}
              />
            ))}
          </Space>
        </SortableContext>
      </div>

      <TaskDetailModal
        open={!!openTask}
        task={openTask}
        onClose={() => setOpenTaskId(null)}
      />
    </>
  );
}
