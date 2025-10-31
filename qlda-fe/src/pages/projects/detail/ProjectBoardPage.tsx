import { PageContainer } from "@ant-design/pro-components";
import {
  Button,
  Card,
  Input,
  Space,
  Typography,
  theme,
  message,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { columnService } from "@/services/column.services";
import { taskService } from "@/services/task.services";
import type { Column, Task } from "@/types/project-board";

const { Title, Text } = Typography;

export default function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { token } = theme.useToken();

  const [columns, setColumns] = useState<Column[]>([]);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // Load cột
  const { data, isLoading } = useQuery({
    queryKey: ["columns", projectId],
    queryFn: () => columnService.getColumns(projectId!),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (data?.data) {
      const sorted = [...data.data].sort((a, b) => a.order - b.order);
      setColumns(sorted);
    }
  }, [data]);

  // Mutation thêm cột
  const createColumn = useMutation({
    mutationFn: (name: string) => columnService.create(projectId!, { name }),
    onSuccess: async () => {
      message.success("Đã thêm cột");
      await qc.invalidateQueries({ queryKey: ["columns", projectId] });
      setAddingColumn(false);
      setNewColumnName("");
    },
  });

  // Sensor
  const sensors = useSensors(useSensor(PointerSensor));

  // Khi kéo thả xong
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIndex = columns.findIndex((c) => c.id === active.id);
    const overIndex = columns.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(columns, activeIndex, overIndex);
    setColumns(reordered);
    await Promise.all(
      reordered.map((c, i) => columnService.update(c.id, { order: i }))
    );
  };

  if (isLoading)
    return (
      <PageContainer>
        <div style={{ textAlign: "center", padding: "100px 0" }}>
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
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={columns} strategy={rectSortingStrategy}>
          <Space
            align="start"
            style={{
              width: "100%",
              overflowX: "auto",
              padding: 8,
            }}
          >
            {columns.map((col) => (
              <SortableColumn key={col.id} column={col} />
            ))}

            {/* Cột thêm mới */}
            <Card
              style={{
                minWidth: 280,
                background: token.colorBgLayout,
                border: `1px dashed ${token.colorBorder}`,
                borderRadius: token.borderRadiusLG,
                textAlign: "center",
              }}
            >
              {addingColumn ? (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Input
                    placeholder="Tên cột..."
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onPressEnter={() =>
                      newColumnName && createColumn.mutate(newColumnName)
                    }
                  />
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() =>
                        newColumnName && createColumn.mutate(newColumnName)
                      }
                    >
                      Thêm
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setAddingColumn(false)}
                    >
                      Hủy
                    </Button>
                  </Space>
                </Space>
              ) : (
                <Button
                  icon={<PlusOutlined />}
                  type="dashed"
                  onClick={() => setAddingColumn(true)}
                  block
                >
                  Thêm cột mới
                </Button>
              )}
            </Card>
          </Space>
        </SortableContext>
      </DndContext>
    </PageContainer>
  );
}

// 🧱 Sortable Column
function SortableColumn({ column }: { column: Column }) {
  const { token } = theme.useToken();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    minWidth: 300,
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
  };

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      title={column.name}
      style={style}
      bodyStyle={{ padding: 8 }}
      extra={
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          danger
          style={{ float: "right" }}
        />
      }
    >
      <TaskList column={column} />
    </Card>
  );
}

// 🧾 Task List
function TaskList({ column }: { column: Column }) {
  const [tasks, setTasks] = useState<Task[]>(column.tasks || []);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleTaskDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIndex = tasks.findIndex((t) => t.id === active.id);
    const overIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, activeIndex, overIndex);
    setTasks(reordered);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleTaskDragEnd}
    >
      <SortableContext items={tasks} strategy={rectSortingStrategy}>
        <Space direction="vertical" style={{ width: "100%" }}>
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
        </Space>
      </SortableContext>
    </DndContext>
  );
}

// 🪄 Sortable Task
function SortableTask({ task }: { task: Task }) {
  const { token } = theme.useToken();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderRadius: token.borderRadius,
    boxShadow: token.boxShadowSecondary,
    background: token.colorBgElevated,
  };

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      size="small"
      style={style}
      hoverable
    >
      <Typography.Text strong>{task.title}</Typography.Text>
      <br />
      <Text type="secondary" ellipsis>
        {task.description || "Không có mô tả"}
      </Text>
    </Card>
  );
}
