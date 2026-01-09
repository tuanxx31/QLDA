import { useState, useCallback } from 'react';
import { Space } from 'antd';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { Column } from '@/types/project-board';
import SortableTask from './SortableTask';
import TaskDetailModal from './TaskDetailModal';
import { useParams } from 'react-router-dom';
import { useProjectPermission } from '@/hooks/useProjectPermission';

export default function TaskList({ column }: { column: Column }) {
  const { projectId } = useParams<{ projectId: string }>();
  const { canEditTasks } = useProjectPermission(projectId);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const tasks = column.tasks || [];
  const taskIds = tasks.map(t => t.id);

  const handleTaskClick = useCallback((taskId: string) => {
    setOpenTaskId(taskId);
  }, []);

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
                disabled={!canEditTasks}
              />
            ))}
          </Space>
        </SortableContext>
      </div>

      <TaskDetailModal
        open={!!openTaskId}
        taskId={openTaskId}
        onClose={() => setOpenTaskId(null)}
      />
    </>
  );
}
