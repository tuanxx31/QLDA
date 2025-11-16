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
  const [taskData, setTaskData] = useState<Task | null>(task);
  const [description, setDescription] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [initialStatus, setInitialStatus] = useState<'todo' | 'doing' | 'done'>('todo');

  const [labelOpen, setLabelOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  /** Khi mở modal → load lại */
  useEffect(() => {
    setTaskData(task);
    setDescription(task?.description ?? "");
    setTempTitle(task?.title ?? "");
    setInitialStatus(task?.status ?? 'todo');
  }, [task]);

  /** Load assignees */
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

  /** Tính ngày hết hạn + trạng thái */
  const dueInfo = useMemo(() => {
    if (!taskData?.dueDate) return null;
    const d = dayjs(taskData.dueDate);
    return {
      formatted: d.format("H:mm DD [thg] MM"),
      isOverdue: d.isBefore(dayjs()),
    };
  }, [taskData]);

  /** Mutation update */
  const updateTaskMutation = useMutation({
    mutationFn: (payload: Partial<Task> & { id: string }) =>
      taskService.update(payload.id, payload),

    onSuccess: (updated: Task) => {
      setTaskData(updated);
      setDescription(updated.description ?? "");
      setTempTitle(updated.title);
      onEdit?.(updated);

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({
        queryKey: ["taskAssignees", updated.id],
      });

      message.success("Đã cập nhật");
    },

    onError: () => message.error("Lỗi cập nhật"),
  });

  /** Lưu mô tả */
  const saveDescription = async () => {
    if (!taskData?.id) return;
    await updateTaskMutation.mutateAsync({ id: taskData.id, description });
  };

  /** Lưu title */
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

  /** Xóa */
  const deleteTaskMutation = useMutation({
    mutationFn: () => taskService.delete(taskData!.id),
    onSuccess: () => {
      message.success("Đã xóa thẻ");
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      onDelete?.(taskData!);
      onClose();
    },
  });

  const visibleAssignees = assignees.length
    ? assignees
    : task?.assignees ?? [];

  if (!taskData) return null;

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={850}
        bodyStyle={{
          background: "#fff",
          padding: "20px 24px",
          display: "flex",
          gap: 24,
        }}
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "space-between",
            }}
          >
            {/* CHECK STATUS ICON */}
            <CheckCircleFilled
              onClick={() => {
                const newStatus = taskData.status === "done" ? initialStatus : "done";
                updateTaskMutation.mutate({
                  id: taskData.id,
                  status: newStatus,
                });
              }}
              style={{
                fontSize: 22,
                cursor: "pointer",
                color:
                  taskData.status === "done" ? "#52c41a" : "rgba(0,0,0,0.3)",
              }}
            />

            {/* TITLE */}
            {editingTitle ? (
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onPressEnter={handleSaveTitle}
                autoFocus
                style={{ fontSize: 18, fontWeight: 600, width: "100%" }}
              />
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: 8 }}
                onDoubleClick={() => setEditingTitle(true)}
              >
                <Title level={4} style={{ margin: 0 }}>
                  {taskData.title}
                </Title>

                <Tooltip title="Sửa tên">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => setEditingTitle(true)}
                  />
                </Tooltip>
              </div>
            )}

            <Popconfirm
              title="Xóa thẻ?"
              onConfirm={() => deleteTaskMutation.mutate()}
            >
              <Button danger type="text" icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        }
      >
        {/* LEFT */}
        <div style={{ flex: 2, overflowY: "auto", paddingRight: 8 }}>
          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <Button icon={<PlusOutlined />}>Thêm</Button>
            <Button
              icon={<TagsOutlined />}
              onClick={() => setLabelOpen(true)}
            >
              Nhãn
            </Button>

            <Button
              icon={<ClockCircleOutlined />}
              onClick={() => setDueDateOpen(true)}
            >
              Ngày
            </Button>

            <DueDateModal
              task={taskData}
              open={dueDateOpen}
              onClose={() => setDueDateOpen(false)}
              onSave={(updated) => setTaskData(updated)}
            />
          </div>

          {/* DUE DATE */}
          {taskData.dueDate && (
            <div style={{ marginBottom: 14 }}>
              <Text strong>Ngày hết hạn:</Text>

              <Space
                style={{
                  marginLeft: 10,
                  padding: "3px 10px",
                  borderRadius: 6,
                  background: "#fff",
                  color: "black",
                  cursor: "pointer",
                }}
                onClick={() => setDueDateOpen(true)}
              >
                <span>{dueInfo?.formatted}</span>

                {taskData.status === "done" ? (
                  <Tag color="green" style={{ borderRadius: 4 }}>
                    Hoàn tất
                  </Tag>
                ) : dueInfo?.isOverdue ? (
                  <Tag color="red" style={{ borderRadius: 4 }}>
                    Quá hạn
                  </Tag>
                ) : null}
              </Space>
            </div>
          )}

          {/* LABELS */}
          {taskData.labels?.length ? (
            <Space wrap style={{ marginBottom: 12 }}>
              {taskData.labels.map((lb) => (
                <Tag key={lb.id} color={lb.color}>
                  {lb.name}
                </Tag>
              ))}
            </Space>
          ) : null}

          {/* MEMBERS */}
          <div style={{ marginBottom: 16 }}>
            <Text strong>Thành viên:</Text>{" "}
            <Space size={4}>
              {assigneesLoading ? (
                <Spin size="small" />
              ) : (
                visibleAssignees.map((u: any) => (
                  <Tooltip key={u.id} title={u.name || u.email}>
                    <Avatar style={{ backgroundColor: "#1677ff" }}>
                      {(u.name || u.email)?.[0]?.toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))
              )}

              <Tooltip title="Thêm thành viên">
                <Avatar
                  size={28}
                  style={{
                    backgroundColor: "#2f2f2f",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => setMemberModalOpen(true)}
                >
                  <PlusOutlined />
                </Avatar>
              </Tooltip>
            </Space>

            {assigneesError && (
              <div style={{ color: "red", marginTop: 6 }}>
                Không thể tải danh sách
              </div>
            )}
          </div>

          <Divider />

          {/* DESCRIPTION */}
          <div>
            <Text strong>Mô tả:</Text>
            <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thêm mô tả..."
              autoSize={{ minRows: 4 }}
              style={{ marginTop: 8 }}
            />

            <Space style={{ marginTop: 8 }}>
              <Button type="primary" onClick={saveDescription}>
                Lưu mô tả
              </Button>
              <Button
                onClick={() =>
                  setDescription(taskData.description ?? "")
                }
              >
                Hủy
              </Button>
            </Space>
          </div>
        </div>

        {/* RIGHT */}
        <div
          style={{
            flex: 1,
            paddingLeft: 16,
            borderLeft: "1px solid #eee",
          }}
        >
          <Title level={5}>Nhận xét & hoạt động</Title>

          <Input placeholder="Viết bình luận..." style={{ marginBottom: 12 }} />

          <div style={{ fontSize: 13, color: "#555" }}>
            <p>
              <b>Tuấn Đình</b> đã cập nhật thẻ này
            </p>
            <p style={{ fontSize: 12, color: "#888" }}>
              Cập nhật lúc:{" "}
              {dayjs(taskData.updatedAt).format("DD/MM/YYYY HH:mm")}
            </p>
          </div>
        </div>
      </Modal>

      {/* LABEL PICKER */}
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

      {/* MEMBER PICKER */}
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
