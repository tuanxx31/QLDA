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
} from "antd";
import {
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import type { Task } from "@/types/task.type";
import MemberAddTaskModal from "./MemberAddTaskModal";
import { taskService } from "@/services/task.services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LabelPicker from "./LabelPicker";
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
  const [description, setDescription] = useState<string>("");

  const [labelOpen, setLabelOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [savingDesc, setSavingDesc] = useState(false);

  useEffect(() => {
    setTaskData(task);
    setDescription(task?.description ?? "");
  }, [task]);

  const {
    data: assignees = [],
    isLoading: assigneesLoading,
    isError: assigneesError,
  } = useQuery({
    queryKey: ["taskAssignees", taskData?.id],
    queryFn: () => taskService.getAssignees(taskData!.id),
    enabled: !!taskData?.id,
    staleTime: 1000 * 30,
  });

  const updateTaskMutation = useMutation({
    mutationFn: (payload: Partial<Task> & { id: string }) =>
      taskService.update(payload.id, payload),
    onSuccess: (updated: Task) => {
      setTaskData(updated);
      setDescription(updated.description ?? "");
      onEdit?.(updated);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskAssignees", updated.id] });
      message.success("Cập nhật công việc thành công");
    },
    onError: () => {
      message.error("Cập nhật thất bại");
    },
  });

  const refreshTask = async () => {
    if (!taskData?.id) return;
    try {
      const updated = await taskService.getByColumn(taskData.columnId);
      setTaskData(updated);
      setDescription(updated.description ?? "");
      onEdit?.(updated);
      queryClient.invalidateQueries({ queryKey: ["taskAssignees", updated.id] });
    } catch (err) {
      message.error("Không thể tải lại công việc");
    }
  };

  const saveDescription = async () => {
    if (!taskData?.id) return;
    setSavingDesc(true);
    try {
      await updateTaskMutation.mutateAsync({ id: taskData.id, description });
    } finally {
      setSavingDesc(false);
    }
  };

  const handleMemberAddSuccess = async () => {
    await refreshTask();
    setMemberModalOpen(false);
  };

  const visibleAssignees = useMemo(() => {
    return assignees?.length ? assignees : taskData?.assignees ?? [];
  }, [assignees, taskData]);

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
          borderRadius: 8,
          padding: "20px 24px",
          display: "flex",
          gap: 24,
          maxHeight: "80vh",
        }}
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              {taskData.title}
            </Title>
            <Space>
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit?.(taskData)}
                />
              </Tooltip>
              <Tooltip title="Xóa">
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete?.(taskData)}
                />
              </Tooltip>
            </Space>
          </div>
        }
      >
        <div style={{ flex: 2, overflowY: "auto", paddingRight: 8 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <Button icon={<PlusOutlined />}>Thêm</Button>
            
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
        selectedIds={taskData.labels?.map((l) => l.id) ?? []}
        onChange={(ids) => {
          setTaskData({ ...taskData, labels: taskData.labels?.filter((l) => ids.includes(l.id)) });
        }}
        onCreateNew={() => console.log("Tạo nhãn mới")}
      />
            <Button icon={<TagsOutlined />} onClick={() => setLabelOpen(true)}>
              Nhãn
            </Button>
            <Button icon={<ClockCircleOutlined />}>Ngày</Button>
            <Button>Việc cần làm</Button>
            <Button>Đính kèm</Button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong>Thành viên:</Text>{" "}
            <Space size={4}>
              {assigneesLoading ? (
                <Spin size="small" />
              ) : visibleAssignees?.length ? (
                visibleAssignees.map((u: any) => (
                  <Tooltip key={u.id} title={u.name || u.email}>
                    <Avatar style={{ backgroundColor: "#f56a00" }}>
                      {(u.name || u.email)?.[0]?.toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))
              ) : (
                <Text type="secondary">Chưa có thành viên</Text>
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
              <div style={{ marginTop: 8, color: "var(--ant-error-color)" }}>
                Không thể tải danh sách thành viên
              </div>
            )}
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <div>
            <Text strong>Mô tả:</Text>
            <Input.TextArea
              placeholder="Thêm mô tả chi tiết hơn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoSize={{ minRows: 4 }}
              style={{ marginTop: 8 }}
            />
            <Space style={{ marginTop: 8 }}>
              <Button
                type="primary"
                onClick={saveDescription}
                loading={savingDesc || updateTaskMutation.isPending || updateTaskMutation.isSuccess}
              >
                Lưu mô tả
              </Button>
              <Button onClick={() => { setDescription(taskData.description ?? ""); }}>
                Hủy
              </Button>
            </Space>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            borderLeft: "1px solid #f0f0f0",
            paddingLeft: 16,
            overflowY: "auto",
            maxHeight: "70vh",
          }}
        >
          <Title level={5} style={{ fontSize: 16 }}>
            Nhận xét và hoạt động
          </Title>
          <Input placeholder="Viết bình luận..." style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 13, color: "#555" }}>
            <p>
              <b>Tuấn Đình</b> đã thêm <b>tothuy0810</b> vào thẻ này
            </p>
            <p style={{ color: "#888", fontSize: 12 }}>
              Cập nhật lần cuối:{" "}
              {taskData.updatedAt
                ? dayjs(taskData.updatedAt).format("DD/MM/YYYY HH:mm")
                : "—"}
            </p>
          </div>
        </div>
      </Modal>

      <MemberAddTaskModal
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        taskId={taskData.id}
        currentAssignees={taskData.assignees?.map((u) => u.id) || []}
        onSuccess={handleMemberAddSuccess}
      />
    </>
  );
}
