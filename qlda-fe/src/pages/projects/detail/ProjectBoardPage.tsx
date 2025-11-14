import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Space,
  Typography,
  message,
  Spin,
  Card,
  theme,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  closestCenter,
  rectIntersection,
  pointerWithin,
  type CollisionDetection,
  KeyboardSensor,
  type DragMoveEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
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
        if (c.tasks?.length)
          c.tasks = [...c.tasks].sort(
            (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
          );
      });
      setColumns(sorted);
    }
  }, [data]);

  const addColumn = useMutation({
    mutationFn: (name: string) => columnService.create(projectId!, { name }),
    onSuccess: res => {
      message.success('Đã thêm cột');
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
      setColumns(prev => [
        ...prev,
        { ...res.data, order: prev.length + 1, tasks: [] },
      ]);
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

  const collisionDetection: CollisionDetection = args => {
    const activeType = args.active?.data?.current?.type;
    
    // Với task: ưu tiên pointerWithin để phát hiện khi hover vào task/column cụ thể
    // Sau đó dùng rectIntersection và closestCenter làm fallback
    if (activeType === 'task') {
      // Ưu tiên pointerWithin để phát hiện chính xác khi hover vào task hoặc column
      const pointerCollisions = pointerWithin(args);
      if (pointerCollisions.length > 0) {
        // Kiểm tra xem có collision với column không (quan trọng cho column rỗng)
        const columnCollision = pointerCollisions.find(
          c => c.data?.current?.type === 'column'
        );
        if (columnCollision) return [columnCollision];
        return pointerCollisions;
      }
      
      // Fallback: dùng rectIntersection để phát hiện collision với các element
      const rectCollisions = rectIntersection(args);
      if (rectCollisions.length > 0) {
        // Ưu tiên column nếu có
        const columnCollision = rectCollisions.find(
          c => c.data?.current?.type === 'column'
        );
        if (columnCollision) return [columnCollision];
        return rectCollisions;
      }
      
      // Cuối cùng dùng closestCenter
      return closestCenter(args);
    }
    
    // Với column: dùng closestCenter để sắp xếp theo vị trí trung tâm
    if (activeType === 'column') {
      return closestCenter(args);
    }
    
    // Fallback mặc định
    return rectIntersection(args);
  };

  const findColumnByTaskId = (taskId: string, cols: Column[] = columns) =>
    cols.find(col => col.tasks?.some(t => t.id === taskId));

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data?.current?.type;
    if (type === 'column') {
      const col = columns.find(c => c.id === event.active.id);
      if (col) setActiveColumn(col);
    }
    if (type === 'task') {
      const t = columns.flatMap(c => c.tasks ?? []).find(t => t.id === event.active.id);
      if (t) setActiveTask(t);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.data?.current?.type !== 'task') return;
  
    const activeId = String(active.id);
    const overId = String(over.id);
    const overType = over.data?.current?.type;
  
    setColumns(prev => {
      // Tìm column chứa task đang được kéo
      const fromCol = findColumnByTaskId(activeId, prev);
      if (!fromCol) return prev;
  
      // Tìm column đích: 
      // - Nếu over là column thì dùng trực tiếp
      // - Nếu over là task thì tìm column chứa task đó
      let toCol: Column | undefined;
      if (overType === 'column') {
        toCol = prev.find(c => c.id === overId);
      } else {
        // over có thể là task hoặc không có type, tìm column chứa task hoặc column có id = overId
        toCol = findColumnByTaskId(overId, prev) || prev.find(c => c.id === overId);
      }
      
      if (!toCol || fromCol.id === toCol.id) return prev;
  
      // Nếu task đang ở trong toCol, không cần di chuyển
      const fromTasks = [...(fromCol.tasks ?? [])];
      const toTasks = [...(toCol.tasks ?? [])];
  
      const fromIdx = fromTasks.findIndex(t => t.id === activeId);
      if (fromIdx === -1) return prev;
  
      // Nếu task đã được di chuyển trong handleDragOver trước đó, không làm gì
      if (toTasks.some(t => t.id === activeId)) return prev;
  
      const [moved] = fromTasks.splice(fromIdx, 1);
  
      // Tính toán vị trí chèn: 
      // - Nếu drop vào column (rỗng hoặc không) thì thêm vào cuối
      // - Nếu drop vào task thì chèn trước task đó
      const isDropOnColumn = overType === 'column' || overId === toCol.id;
      let overIdx = toTasks.length; // Mặc định là cuối danh sách
      
      if (!isDropOnColumn) {
        // Drop vào một task cụ thể
        const targetTaskIdx = toTasks.findIndex(t => t.id === overId);
        if (targetTaskIdx !== -1) {
          overIdx = targetTaskIdx;
        }
      }
  
      return prev.map(c => {
        if (c.id === fromCol.id) {
          return { ...c, tasks: fromTasks };
        }
        if (c.id === toCol.id) {
          return { 
            ...c, 
            tasks: [...toTasks.slice(0, overIdx), moved, ...toTasks.slice(overIdx)] 
          };
        }
        return c;
      });
    });
  };
  

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
  
    if (!over) {
      setActiveTask(null);
      setActiveColumn(null);
      return;
    }
  
    const activeType = active.data?.current?.type;
    const activeId = String(active.id);
    const overId = String(over.id);
    const overType = over.data?.current?.type;
  
    // =========================================
    // 1) DRAG COLUMN
    // =========================================
    if (activeType === 'column') {
      setColumns(prev => {
        const oldIdx = prev.findIndex(c => c.id === activeId);
        const newIdx = prev.findIndex(c => c.id === overId);
  
        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return prev;
  
        const reordered = arrayMove(prev, oldIdx, newIdx).map((c, i) => ({
          ...c,
          order: i + 1,
        }));
  
        // cập nhật DB debounce
        debouncedUpdateOrder(reordered);
  
        return reordered;
      });
  
      setActiveColumn(null);
      return;
    }
  
    // =========================================
    // 2) DRAG TASK
    // =========================================
  
    setColumns(prev => {
      // backup để rollback nếu API lỗi
      const previousState = JSON.parse(JSON.stringify(prev));
  
      const fromCol = findColumnByTaskId(activeId, prev);
  
      // xác định column đích
      let toCol: Column | undefined;
      if (overType === 'column') {
        toCol = prev.find(c => c.id === overId);
      } else {
        toCol =
          findColumnByTaskId(overId, prev) ||
          prev.find(c => c.id === overId);
      }
  
      if (!fromCol || !toCol) return prev;
  
      // ===============================
      // CASE A: DRAG TRONG CÙNG COLUMN
      // ===============================
      if (fromCol.id === toCol.id) {
        const tasks = [...(fromCol.tasks ?? [])];
        const fromIdx = tasks.findIndex(t => t.id === activeId);
  
        // nếu thả vào column (không phải task)
        if (overType === 'column' || overId === toCol.id) {
          // Không reorder, chỉ drop vào column → bỏ qua
          return prev;
        }
  
        const overIdx = tasks.findIndex(t => t.id === overId);
        if (fromIdx === -1 || overIdx === -1 || fromIdx === overIdx) {
          return prev;
        }
  
        const reordered = arrayMove(tasks, fromIdx, overIdx);
  
        // prev / next cho API
        const prevTask = reordered[overIdx - 1];
        const nextTask = reordered[overIdx + 1];
  
        // gọi API update position
        taskService
          .updatePosition(
            activeId,
            prevTask?.id,
            nextTask?.id,
            undefined // không đổi column
          )
          .catch(() => {
            message.error('Không thể lưu vị trí nhiệm vụ');
            setColumns(previousState);
            queryClient.invalidateQueries({
              queryKey: ['columns', projectId],
            });
          });
  
        return prev.map(c =>
          c.id === fromCol.id ? { ...c, tasks: reordered } : c
        );
      }
  
      // ===============================
      // CASE B: DRAG SANG COLUMN KHÁC
      // ===============================
  
      const fromTasks = [...(fromCol.tasks ?? [])];
      const toTasks = [...(toCol.tasks ?? [])];
  
      const fromIdx = fromTasks.findIndex(t => t.id === activeId);
      if (fromIdx === -1) return prev;
  
      const [moved] = fromTasks.splice(fromIdx, 1);
      moved.columnId = toCol.id;
  
      // xác định vị trí chèn
      const isDropOnColumn =
        overType === 'column' || overId === toCol.id;
  
      let overIdx = toTasks.length; // mặc định là cuối
  
      if (!isDropOnColumn) {
        const targetIdx = toTasks.findIndex(t => t.id === overId);
        if (targetIdx !== -1) overIdx = targetIdx;
      }
  
      // chèn
      const newToTasks = [
        ...toTasks.slice(0, overIdx),
        moved,
        ...toTasks.slice(overIdx),
      ];
  
      // prev / next
      const prevTask =
        overIdx > 0 ? newToTasks[overIdx - 1] : undefined;
      const nextTask =
        overIdx < newToTasks.length - 1
          ? newToTasks[overIdx + 1]
          : undefined;
  
      // API update
      taskService
        .updatePosition(
          moved.id,
          prevTask?.id,
          nextTask?.id,
          toCol.id
        )
        .catch(() => {
          message.error('Không thể lưu vị trí nhiệm vụ');
          setColumns(previousState);
          queryClient.invalidateQueries({
            queryKey: ['columns', projectId],
          });
        });
  
      return prev.map(c =>
        c.id === fromCol.id
          ? { ...c, tasks: fromTasks }
          : c.id === toCol.id
          ? { ...c, tasks: newToTasks }
          : c
      );
    });
  
    setActiveTask(null);
  };
  
  

  const handleDragMove = (_event: DragMoveEvent) => {
    // Có thể thêm logic xử lý khi drag move nếu cần
  };

  useEffect(() => {
    const handle = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handle);
    return () => document.removeEventListener('fullscreenchange', handle);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen().catch(() => message.error('Không thể bật fullscreen'));
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
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
        >
          <SortableContext items={columnIds} strategy={rectSortingStrategy}>
            <Space align="start" style={{ overflowX: 'auto', padding: 8, flex: 1 }}>
              {columns.map(col => (
                <div
                  key={col.id}
                  style={{
                    opacity: activeColumn?.id === col.id ? 0.3 : 1,
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
