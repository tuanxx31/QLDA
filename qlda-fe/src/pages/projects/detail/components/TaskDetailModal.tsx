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
  theme,
} from "antd";
import {
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  TagsOutlined,
  CheckCircleFilled,
  UserOutlined,
  FileTextOutlined,
  FlagOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import type { Task } from "@/types/task.type";
import type { User } from "@/types/user.type";
import MemberAddTaskModal from "./MemberAddTaskModal";
import { taskService } from "@/services/task.services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LabelPicker from "./LabelPicker";
import DueDateModal from "./DateComponet";
import PriorityPicker from "./PriorityPicker";
import { useParams } from "react-router-dom";
import { invalidateProgressQueries } from "@/utils/invalidateProgress";
import { invalidateStatisticsQueries } from "@/utils/invalidateStatistics";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import { commentService } from "@/services/comment.services";
import { getAvatarUrl } from "@/utils/avatarUtils";
import { projectService } from "@/services/project.services";
import { markTaskAsRead } from "@/utils/commentBadgeUtils";
import useAuth from "@/hooks/useAuth";
import { useProjectPermission } from "@/hooks/useProjectPermission";
import { isForbiddenError } from "@/utils/errorHandler";

const { Title, Text } = Typography;
type TaskLabel = NonNullable<Task["labels"]>[number];

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
  const { authUser } = useAuth();
  const { canDeleteTasks, canEditTasks } = useProjectPermission(projectId);
  const { token } = theme.useToken();
  const [taskData, setTaskData] = useState<Task | null>(task);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getById(projectId!),
    enabled: !!projectId,
  });
  const [description, setDescription] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);

  const [labelOpen, setLabelOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);

  const [editingComment, setEditingComment] = useState<{ id: string; content: string; fileUrl?: string; mentions?: User[] } | null>(null);

  const handleLabelMetaUpdate = (label: Pick<TaskLabel, "id" | "name" | "color">) => {
    setTaskData((prev) => {
      if (!prev || !prev.labels) return prev;
      return {
        ...prev,
        labels: prev.labels.map((lb) =>
          lb.id === label.id
            ? {
              ...lb,
              name: label.name,
              color: label.color,
            }
            : lb,
        ),
      };
    });
  };

  const handleLabelDelete = (labelId: string) => {
    setTaskData((prev) => {
      if (!prev || !prev.labels) return prev;
      return {
        ...prev,
        labels: prev.labels.filter((lb) => lb.id !== labelId),
      };
    });
  };


  const {
    data: fetchedTask,
  } = useQuery({
    queryKey: ["task", task?.id],
    queryFn: () => taskService.getById(task!.id),
    enabled: !!task?.id && open,
    staleTime: 30000,
  });


  const {
    data: assignees = [],
    isLoading: assigneesLoading,
    isError: assigneesError,
  } = useQuery({
    queryKey: ["taskAssignees", task?.id],
    queryFn: () => taskService.getAssignees(task!.id),
    enabled: !!task?.id && open,
    staleTime: 30000,
    retry: (failureCount, error) => {

      if (isForbiddenError(error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const {
    data: commentsData,
    isError: commentsError,
  } = useQuery({
    queryKey: ["comments", taskData?.id],
    queryFn: () => commentService.getComments(taskData!.id, 1, 50),
    enabled: !!taskData?.id && open,
    refetchInterval: 2500,
    retry: (failureCount, error) => {

      if (isForbiddenError(error)) {
        return false;
      }
      return failureCount < 3;
    },
  });


  useEffect(() => {
    if (fetchedTask) {
      setTaskData(fetchedTask);
      setDescription(fetchedTask.description ?? "");
      setTempTitle(fetchedTask.title ?? "");
    } else if (task) {
      setTaskData(task);
      setDescription(task.description ?? "");
      setTempTitle(task.title ?? "");
    } else {
      setTaskData(null);
      setDescription("");
      setTempTitle("");
    }
  }, [fetchedTask, task?.id]);


  useEffect(() => {
    if (open && taskData?.id && authUser?.id) {
      markTaskAsRead(taskData.id, authUser.id);

      queryClient.invalidateQueries({
        queryKey: ['comments', taskData.id],
        refetchType: 'active',
      });

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    }
  }, [open, taskData?.id, authUser?.id, queryClient]);


  const dueInfo = useMemo(() => {
    if (!taskData?.dueDate) return null;
    const d = dayjs(taskData.dueDate);
    return {
      formatted: d.format("H:mm DD/MM/YYYY"),
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
        invalidateStatisticsQueries(queryClient, projectId);
      }

      message.success("Đã cập nhật");
    },

    onError: () => message.error("Lỗi cập nhật"),
  });


  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "todo" | "done" }) =>
      taskService.updateStatus(id, status),

    onSuccess: (response, variables) => {
      let updatedTask: Task | null = null;
      setTaskData((prev) => {
        if (!prev) return prev;
        updatedTask = {
          ...prev,
          status: response.status,
          completedAt: response.completedAt,
        };
        return updatedTask;
      });

      if (updatedTask) {
        onEdit?.(updatedTask);
      }

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      queryClient.invalidateQueries({
        queryKey: ["taskAssignees", variables.id],
      });
      if (projectId) {
        invalidateProgressQueries(queryClient, projectId);
        invalidateStatisticsQueries(queryClient, projectId);
      }


    },

    onError: () => message.error("Lỗi cập nhật trạng thái"),
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
        invalidateStatisticsQueries(queryClient, projectId);
      }
      onDelete?.(taskData!);
      onClose();
    },
  });





  const visibleAssignees = assignees.length
    ? assignees
    : fetchedTask?.assignees?.length
      ? fetchedTask.assignees
      : task?.assignees ?? [];

  const unassignUsersMutation = useMutation({
    mutationFn: (userIds: string[]) =>
      taskService.unassignUsers(taskData!.id, userIds),
    onSuccess: () => {
      message.success("Đã hủy gán thành viên");
      queryClient.invalidateQueries({ queryKey: ["taskAssignees", taskData?.id] });
      queryClient.invalidateQueries({ queryKey: ["task", taskData?.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      if (projectId) {
        invalidateProgressQueries(queryClient, projectId);
        invalidateStatisticsQueries(queryClient, projectId);
      }
    },
    onError: () => message.error("Lỗi khi hủy gán thành viên"),
  });

  if (!taskData) return null;


  const getStatusColor = () => {
    if (taskData.status === "done") return "#52c41a";

  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={"70vw"}
        styles={{
          body: {
            padding: 0,
            position: "relative",
          },
        }}
        title={
          <div style={{ position: "relative", paddingBottom: 16, paddingRight: 40 }}>
            { }
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

              }}
            >
              { }
              <CheckCircleFilled
                onClick={(e) => {
                  e.stopPropagation();
                  if (!taskData?.id) return;

                  const currentStatus = taskData.status;
                  const newStatus: "todo" | "done" =
                    currentStatus === "done" ? "todo" : "done";

                  updateStatusMutation.mutate({
                    id: taskData.id,
                    status: newStatus,
                  });
                }}
                style={{
                  fontSize: 22,
                  cursor: "pointer",
                  border: "1px solid #b2b2b2",
                  borderRadius: "50%",
                  color:
                    taskData.status === "done"
                      ? "#52c41a"
                      : "white",
                  transition: "color 0.2s",
                  flexShrink: 0,
                }}
              />

              {/* Task Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingTitle ? (
                  <div style={{ position: "relative" }}>
                    <Input.TextArea
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveTitle();
                        }
                        if (e.key === "Escape") {
                          setTempTitle(taskData.title);
                          setEditingTitle(false);
                        }
                      }}
                      autoFocus
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        width: "100%",
                        resize: "none",
                        borderRadius: 6,
                        padding: "8px 12px",
                      }}
                      placeholder="Nhập tên nhiệm vụ..."
                    />
                    <div style={{
                      marginTop: 8,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}>
                      <Button
                        type="primary"
                        size="small"
                        onClick={handleSaveTitle}
                        loading={updateTaskMutation.isPending}
                        style={{ borderRadius: 6 }}
                      >
                        Lưu
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setTempTitle(taskData.title);
                          setEditingTitle(false);
                        }}
                        style={{ borderRadius: 6 }}
                      >
                        Hủy
                      </Button>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Enter để lưu, Esc để hủy
                      </Text>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <Tooltip title={taskData.title}>
                      <Title
                        level={4}
                        style={{
                          margin: 0,
                          flex: 1,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: "1.4",
                          wordBreak: "break-word",
                          cursor: canEditTasks ? "pointer" : "default",
                        }}
                        onClick={canEditTasks ? () => setEditingTitle(true) : undefined}
                      >
                        {taskData.title}
                      </Title>
                    </Tooltip>

                    {canEditTasks && (
                      <Tooltip title="Sửa tên">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => setEditingTitle(true)}
                          style={{
                            color: token.colorTextTertiary,
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        />
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>

              {canDeleteTasks && (
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
              )}
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
          {/* Left column - Main content */}
          <div style={{ flex: 2, overflowY: "auto", paddingRight: 8 }}>
            {/* Metadata Section */}
            <div
              style={{
                background: token.colorFillQuaternary,
                borderRadius: 8,
                padding: 16,
                marginBottom: 20,
              }}
            >
              {/* Quick actions row */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Button
                  size="small"
                  icon={<TagsOutlined />}
                  onClick={() => setLabelOpen(true)}
                  style={{ borderRadius: 6 }}
                >
                  Nhãn
                </Button>
                <Button
                  size="small"
                  icon={<FlagOutlined />}
                  onClick={() => setPriorityOpen(true)}
                  style={{ borderRadius: 6 }}
                >
                  Mức độ ưu tiên
                </Button>
                <Button
                  size="small"
                  icon={<ClockCircleOutlined />}
                  onClick={() => setDueDateOpen(true)}
                  style={{ borderRadius: 6 }}
                >
                  Ngày hết hạn
                </Button>
              </div>

              <DueDateModal
                task={taskData}
                open={dueDateOpen}
                onClose={() => setDueDateOpen(false)}
                onSave={(updated) => setTaskData(updated)}
              />

              {/* Due date info */}
              {taskData.dueDate && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <ClockCircleOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: token.colorTextTertiary, display: "block" }}>
                      Ngày hết hạn
                    </Text>
                    <Space
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: token.colorBgContainer,
                        cursor: "pointer",
                        display: "inline-flex",
                        marginTop: 4,
                        border: `1px solid ${token.colorBorderSecondary}`,
                      }}
                      onClick={() => setDueDateOpen(true)}
                    >
                      <span style={{ fontSize: 13 }}>
                        {taskData.startDate ? dayjs(taskData.startDate).format("DD/MM") + " - " : ""}
                        {dueInfo?.formatted}
                      </span>
                      {taskData.status === "done" && dueInfo?.isOverdue ? (
                        <Tag color="orange" style={{ borderRadius: 4, margin: 0 }}>
                          Hoàn thành trễ
                        </Tag>
                      ) : taskData.status === "done" ? (
                        <Tag color="green" style={{ borderRadius: 4, margin: 0 }}>
                          Hoàn thành
                        </Tag>
                      ) : dueInfo?.isOverdue ? (
                        <Tag color="red" style={{ borderRadius: 4, margin: 0 }}>
                          Quá hạn
                        </Tag>
                      ) : null}
                    </Space>
                  </div>
                </div>
              )}

              {/* Labels */}
              {taskData.labels?.length ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <TagsOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: token.colorTextTertiary, display: "block", marginBottom: 4 }}>
                      Nhãn
                    </Text>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {taskData.labels.map((lb) => (
                        <Tag
                          key={lb.id}
                          color={lb.color}
                          style={{
                            minWidth: 48,
                            height: 22,
                            textAlign: "center",
                            borderRadius: 4,
                            margin: 0,
                          }}
                        >
                          {lb.name || ""}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Priority */}
              {taskData.priority && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <FlagOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: token.colorTextTertiary, display: "block", marginBottom: 4 }}>
                      Mức độ ưu tiên
                    </Text>
                    <Tag
                      color={
                        taskData.priority === 'low' ? 'default' :
                          taskData.priority === 'medium' ? 'orange' : 'red'
                      }
                      style={{
                        cursor: canEditTasks ? 'pointer' : 'default',
                        minWidth: 70,
                        textAlign: 'center',
                        borderRadius: 4,
                        margin: 0,
                      }}
                      onClick={canEditTasks ? () => setPriorityOpen(true) : undefined}
                    >
                      {taskData.priority === 'low' ? 'Thấp' :
                        taskData.priority === 'medium' ? 'Trung bình' : 'Cao'}
                    </Tag>
                  </div>
                </div>
              )}

              {/* Members */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <UserOutlined style={{ color: token.colorTextTertiary, fontSize: 14, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: token.colorTextTertiary, display: "block", marginBottom: 6 }}>
                    Thành viên
                  </Text>
                  <Space size={6} wrap>
                    {assigneesLoading ? (
                      <Spin size="small" />
                    ) : (
                      visibleAssignees.map((u: any) => {
                        const avatarElement = (
                          <Avatar
                            size={28}
                            src={getAvatarUrl(u?.avatar)}
                            style={{
                              border: `1px solid ${token.colorBorderSecondary}`,
                              backgroundColor: token.colorPrimary,
                              color: "#fff",
                              cursor: canEditTasks ? "pointer" : "default",
                            }}
                          >
                            {(u.name || u.email)?.[0]?.toUpperCase()}
                          </Avatar>
                        );

                        return canEditTasks ? (
                          <Popconfirm
                            key={u.id}
                            title="Hủy gán thành viên này?"
                            onConfirm={() => unassignUsersMutation.mutate([u.id])}
                            okText="Xác nhận"
                            cancelText="Hủy"
                          >
                            <Tooltip title={u.name || u.email}>
                              {avatarElement}
                            </Tooltip>
                          </Popconfirm>
                        ) : (
                          <Tooltip key={u.id} title={u.name || u.email}>
                            {avatarElement}
                          </Tooltip>
                        );
                      })
                    )}
                    <Tooltip title="Thêm thành viên">
                      <Avatar
                        size={28}
                        style={{
                          backgroundColor: token.colorFillSecondary,
                          color: token.colorTextSecondary,
                          cursor: "pointer",
                          border: `1px dashed ${token.colorBorder}`,
                        }}
                        onClick={() => setMemberModalOpen(true)}
                      >
                        <PlusOutlined style={{ fontSize: 12 }} />
                      </Avatar>
                    </Tooltip>
                  </Space>
                  {assigneesError && !isForbiddenError(assigneesError) && (
                    <div style={{ color: token.colorError, marginTop: 6, fontSize: 12 }}>
                      Không thể tải danh sách thành viên
                    </div>
                  )}
                  {assigneesError && isForbiddenError(assigneesError) && (
                    <div style={{ color: token.colorTextTertiary, marginTop: 6, fontSize: 12 }}>
                      Không có quyền xem danh sách thành viên
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div
              style={{
                background: token.colorFillQuaternary,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileTextOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />
                  <Text strong style={{ fontSize: 13, color: token.colorTextSecondary }}>
                    Mô tả
                  </Text>
                </div>
                {!editingDescription && canEditTasks && (
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setEditingDescription(true)}
                    style={{ color: token.colorTextTertiary }}
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </div>

              {editingDescription ? (
                <>
                  <Input.TextArea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Thêm mô tả cho nhiệm vụ này..."
                    autoSize={{ minRows: 3, maxRows: 10 }}
                    autoFocus
                    style={{
                      borderRadius: 6,
                      border: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  />
                  <Space style={{ marginTop: 12 }}>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        saveDescription();
                        setEditingDescription(false);
                      }}
                      loading={updateTaskMutation.isPending}
                      style={{ borderRadius: 6 }}
                    >
                      Lưu
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setDescription(taskData.description ?? "");
                        setEditingDescription(false);
                      }}
                      style={{ borderRadius: 6 }}
                    >
                      Hủy
                    </Button>
                  </Space>
                </>
              ) : (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 6,
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    minHeight: 60,
                    cursor: canEditTasks ? "pointer" : "default",
                  }}
                  onClick={canEditTasks ? () => setEditingDescription(true) : undefined}
                >
                  {taskData.description ? (
                    <Text style={{
                      fontSize: 13,
                      color: token.colorText,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}>
                      {taskData.description}
                    </Text>
                  ) : (
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {canEditTasks ? "Nhấp để thêm mô tả..." : "Chưa có mô tả"}
                    </Text>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right column - Comments */}
          <div
            style={{
              flex: 1,
              paddingLeft: 20,
              borderLeft: `1px solid ${token.colorBorderSecondary}`,
              display: "flex",
              flexDirection: "column",
              maxHeight: "600px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <CommentOutlined style={{ color: token.colorTextSecondary, fontSize: 16 }} />
              <Title level={5} style={{ fontSize: 14, margin: 0 }}>
                Bình luận
              </Title>
            </div>

            <div style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
              {commentsError && isForbiddenError(commentsError) ? (
                <div style={{ color: "#999", textAlign: "center", padding: "20px 0" }}>
                  Không có quyền xem bình luận
                </div>
              ) : (
                <CommentList
                  taskId={taskData.id}
                  comments={commentsData?.data || []}
                  projectOwnerId={project?.owner?.id}
                  projectId={projectId!}
                  onEdit={(comment) => {
                    setEditingComment({
                      id: comment.id,
                      content: comment.content,
                      fileUrl: comment.fileUrl,
                      mentions: comment.mentions,
                    });
                  }}
                />
              )}
            </div>

            <CommentInput
              taskId={taskData.id}
              projectId={projectId!}
              editingComment={editingComment}
              onCancelEdit={() => setEditingComment(null)}
            />
          </div>
        </div>
      </Modal>

      { }
      <LabelPicker
        open={labelOpen}
        onClose={() => setLabelOpen(false)}
        taskId={taskData.id}
        selectedIds={taskData.labels?.map((lb) => lb.id) ?? []}
        onTaskUpdate={(updatedTask) => {

          setTaskData(updatedTask);
          onEdit?.(updatedTask);
        }}
        onLabelUpdate={handleLabelMetaUpdate}
        onLabelDelete={handleLabelDelete}
      />

      { }
      <MemberAddTaskModal
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        taskId={taskData.id}
        currentAssignees={visibleAssignees.map((u: any) => u.id)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["taskAssignees", taskData.id] });
          queryClient.invalidateQueries({ queryKey: ["task", taskData.id] });
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          queryClient.invalidateQueries({ queryKey: ["columns"] });
        }}
      />

      { }
      <PriorityPicker
        task={taskData}
        open={priorityOpen}
        onClose={() => setPriorityOpen(false)}
        onSave={(updated) => {
          setTaskData(updated);
          onEdit?.(updated);
        }}
      />
    </>
  );
}
