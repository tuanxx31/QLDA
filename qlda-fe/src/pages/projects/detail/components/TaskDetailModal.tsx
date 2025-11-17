import {
  Modal,
  Typography,
  Avatar,
  Divider,
  Space,
  Tooltip,
  Button,
  Input,
  message,
  Spin,
  Tag,
  Popconfirm,
} from "antd";
import {
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  TagsOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import type { Task } from "@/types/task.type";
import MemberAddTaskModal from "./MemberAddTaskModal";
import { taskService } from "@/services/task.services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LabelPicker from "./LabelPicker";
import DueDateModal from "./DateComponet";
import { useParams } from "react-router-dom";
import { invalidateProgressQueries } from "@/utils/invalidateProgress";

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export default function TaskDetailModal({
  open,
  onClose,
  task,
  onEdit,
  onDelete,
}: Props) {
  const queryClient = useQueryClient();
  const { projectId } = useParams<{ projectId: string }>();
  const [taskData, setTaskData] = useState<Task | null>(task);
  const [description, setDescription] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [initialStatus, setInitialStatus] = useState<'todo' | 'done'>('todo');

  const [labelOpen, setLabelOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  
  useEffect(() => {
    if (task) {
      setTaskData(task);
      setDescription(task.description ?? "");
      setTempTitle(task.title ?? "");
      
      
      setInitialStatus(task.status === "done" ? "todo" : task.status);
    }
  }, [task]);

  
  const {
    data: assignees = [],
    isLoading: assigneesLoading,
    isError: assigneesError,
  } = useQuery({
    queryKey: ["taskAssignees", taskData?.id],
    queryFn: () => taskService.getAssignees(taskData!.id),
    enabled: !!taskData?.id,
    staleTime: 30000,
  });

  
  const dueInfo = useMemo(() => {
    if (!taskData?.dueDate) return null;
    const d = dayjs(taskData.dueDate);
    return {
      formatted: d.format("H:mm DD [thg] MM"),
      isOverdue: d.isBefore(dayjs()),
    };
  }, [taskData]);

  
  const updateTaskMutation = useMutation({
    mutationFn: (payload: Partial<Task> & { id: string }) =>
      taskService.update(payload.id, payload),

    onSuccess: (updated: Task) => {
      setTaskData(updated);
      setDescription(updated.description ?? "");
      setTempTitle(updated.title);
      onEdit?.(updated);

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      queryClient.invalidateQueries({
        queryKey: ["taskAssignees", updated.id],
      });
      if (projectId) {
        invalidateProgressQueries(queryClient, projectId);
      }

      message.success("Đã cập nhật");
    },

    onError: () => message.error("Lỗi cập nhật"),
  });

  
  const saveDescription = async () => {
    if (!taskData?.id) return;
    await updateTaskMutation.mutateAsync({ id: taskData.id, description });
  };

  
  const handleSaveTitle = async () => {
    if (!taskData?.id) return;
    const newTitle = tempTitle.trim();
    if (!newTitle || newTitle === taskData.title) {
      setEditingTitle(false);
      return;
    }
    await updateTaskMutation.mutateAsync({ id: taskData.id, title: newTitle });
    setEditingTitle(false);
  };

  
  const deleteTaskMutation = useMutation({
    mutationFn: () => taskService.delete(taskData!.id),
    onSuccess: () => {
      message.success("Đã xóa thẻ");
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      if (projectId) {
        invalidateProgressQueries(queryClient, projectId);
      }
      onDelete?.(taskData!);
      onClose();
    },
  });

  const visibleAssignees = assignees.length
    ? assignees
    : task?.assignees ?? [];

  if (!taskData) return null;

  
  const getStatusColor = () => {
    if (taskData.status === "done") return "#52c41a";
    return "#faad14"; 
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={850}
        styles={{
          body: {
            padding: 0,
            position: "relative",
          },
        }}
        title={
          <div style={{ position: "relative", paddingBottom: 16, paddingRight: 40 }}>
            {}
            {taskData.status !== "done" && (
              <div
                style={{
                  position: "absolute",
                  top: -24,
                  left: -24,
                  right: -24,
                  height: 4,
                  backgroundColor: getStatusColor(),
                  borderRadius: "4px 4px 0 0",
                }}
              />
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: taskData.status !== "done" ? 8 : 0,
              }}
            >
              {}
              <CheckCircleFilled
                onClick={(e) => {
                  e.stopPropagation();
                  if (!taskData?.id) return;
                  
                  const currentStatus = taskData.status;
                  let newStatus: 'todo' | 'done';
                  
                  if (currentStatus === "done") {
                    
                    newStatus = initialStatus;
                  } else {
                    
                    newStatus = "done";
                    setInitialStatus(currentStatus);
                  }
                  
                  updateTaskMutation.mutate({
                    id: taskData.id,
                    status: newStatus,
                    completedAt: newStatus === "done" ? new Date().toISOString() : undefined,
                  });
                }}
                style={{
                  fontSize: 22,
                  cursor: "pointer",
                  color:
                    taskData.status === "done"
                      ? "#52c41a"
                      : "rgba(0,0,0,0.3)",
                  transition: "color 0.2s",
                  flexShrink: 0,
                }}
              />

              {}
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingTitle ? (
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onPressEnter={handleSaveTitle}
                    autoFocus
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      width: "100%",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                    onDoubleClick={() => setEditingTitle(true)}
                  >
                    <Title 
                      level={4} 
                      style={{ 
                        margin: 0, 
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {taskData.title}
                    </Title>

                    <Tooltip title="Sửa tên">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => setEditingTitle(true)}
                        style={{ color: "#999", flexShrink: 0 }}
                      />
                    </Tooltip>
                  </div>
                )}
              </div>

              <Space size={4} style={{ flexShrink: 0 }}>
                <Popconfirm
                  title="Xóa thẻ?"
                  onConfirm={() => deleteTaskMutation.mutate()}
                >
                  <Button
                    danger
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{ color: "#999" }}
                  />
                </Popconfirm>
              </Space>
            </div>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            gap: 24,
            padding: "20px 24px",
            minHeight: 400,
          }}
        >
          {}
          <div style={{ flex: 2, overflowY: "auto", paddingRight: 8 }}>
            {}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <Button
                size="small"
                icon={<TagsOutlined />}
                onClick={() => setLabelOpen(true)}
              >
                Nhãn
              </Button>

              <Button
                size="small"
                icon={<ClockCircleOutlined />}
                onClick={() => setDueDateOpen(true)}
              >
                Ngày hết hạn
              </Button>

              <DueDateModal
                task={taskData}
                open={dueDateOpen}
                onClose={() => setDueDateOpen(false)}
                onSave={(updated) => setTaskData(updated)}
              />
            </div>

            {}
            {taskData.dueDate && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 13, color: "#666" }}>
                  Ngày hết hạn:
                </Text>
                <Space
                  style={{
                    marginTop: 6,
                    padding: "4px 12px",
                    borderRadius: 6,
                    background: "#f5f5f5",
                    cursor: "pointer",
                    display: "inline-flex",
                  }}
                  onClick={() => setDueDateOpen(true)}
                >
                  <ClockCircleOutlined style={{ color: "#999" }} />
                  <span style={{ fontSize: 13 }}>{dueInfo?.formatted}</span>

                  {taskData.status === "done" ? (
                    <Tag color="green" style={{ borderRadius: 4, margin: 0 }}>
                      Hoàn tất
                    </Tag>
                  ) : dueInfo?.isOverdue ? (
                    <Tag color="red" style={{ borderRadius: 4, margin: 0 }}>
                      Quá hạn
                    </Tag>
                  ) : null}
                </Space>
              </div>
            )}

            {}
            {taskData.labels?.length ? (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 13, color: "#666" }}>
                  Nhãn:
                </Text>
                <Space wrap style={{ marginTop: 6 }}>
                  {taskData.labels.map((lb) => (
                    <Tag key={lb.id} color={lb.color} style={{ borderRadius: 4 }}>
                      {lb.name}
                    </Tag>
                  ))}
                </Space>
              </div>
            ) : null}

            {}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 13, color: "#666" }}>
                Thành viên:
              </Text>
              <Space size={6} style={{ marginTop: 6 }}>
                {assigneesLoading ? (
                  <Spin size="small" />
                ) : (
                  visibleAssignees.map((u: any) => (
                    <Tooltip key={u.id} title={u.name || u.email}>
                      <Avatar
                        size={24}
                        style={{
                          border: "1px solid #eee",
                          backgroundColor: "#1677ff",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        {(u.name || u.email)?.[0]?.toUpperCase()}
                      </Avatar>
                    </Tooltip>
                  ))
                )}

                <Tooltip title="Thêm thành viên">
                  <Avatar
                    size={24}
                    style={{
                      backgroundColor: "#2f2f2f",
                      color: "#fff",
                      cursor: "pointer",
                      border: "1px solid #eee",
                    }}
                    onClick={() => setMemberModalOpen(true)}
                  >
                    <PlusOutlined style={{ fontSize: 12 }} />
                  </Avatar>
                </Tooltip>
              </Space>

              {assigneesError && (
                <div style={{ color: "red", marginTop: 6, fontSize: 12 }}>
                  Không thể tải danh sách
                </div>
              )}
            </div>

            <Divider style={{ margin: "16px 0" }} />

            {}
            <div>
              <Text strong style={{ fontSize: 13, color: "#666" }}>
                Mô tả:
              </Text>
              <Input.TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Thêm mô tả..."
                autoSize={{ minRows: 4 }}
                style={{
                  marginTop: 8,
                  borderRadius: 6,
                }}
              />

              <Space style={{ marginTop: 8 }}>
                <Button
                  type="primary"
                  size="small"
                  onClick={saveDescription}
                  loading={updateTaskMutation.isPending}
                >
                  Lưu mô tả
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    setDescription(taskData.description ?? "")
                  }
                >
                  Hủy
                </Button>
              </Space>
            </div>
          </div>

          {}
          <div
            style={{
              flex: 1,
              paddingLeft: 16,
              borderLeft: "1px solid #eee",
            }}
          >
            <Title level={5} style={{ fontSize: 14, marginBottom: 12 }}>
              Nhận xét & hoạt động
            </Title>

            <Input
              placeholder="Viết bình luận..."
              style={{ marginBottom: 12, borderRadius: 6 }}
            />

            <div style={{ fontSize: 13, color: "#555" }}>
              <p style={{ marginBottom: 4 }}>
                <b>Tuấn Đình</b> đã cập nhật thẻ này
              </p>
              <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
                Cập nhật lúc:{" "}
                {dayjs(taskData.updatedAt).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {}
      <LabelPicker
        open={labelOpen}
        onClose={() => setLabelOpen(false)}
        labels={[
          { id: "1", name: "Done", color: "green" },
          { id: "2", name: "In Progress", color: "orange" },
          { id: "3", name: "Bug", color: "red" },
          { id: "4", name: "Review", color: "purple" },
          { id: "5", name: "Idea", color: "blue" },
        ]}
        selectedIds={taskData.labels?.map((lb) => lb.id) ?? []}
        onChange={(ids) => {
          const labels = ids.map((id) => ({
            id,
            name: id,
            color: "blue",
          }) as any);
          setTaskData({ ...taskData, labels });
        }}
      />

      {}
      <MemberAddTaskModal
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        taskId={taskData.id}
        currentAssignees={taskData.assignees?.map((u) => u.id) ?? []}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          setMemberModalOpen(false);
        }}
      />
    </>
  );
}
