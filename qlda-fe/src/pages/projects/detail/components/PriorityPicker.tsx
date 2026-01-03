import { useState, useEffect } from "react";
import { Modal, Radio, Button, Space, Typography, message, Tag } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { invalidateStatisticsQueries } from "@/utils/invalidateStatistics";
import { invalidateProgressQueries } from "@/utils/invalidateProgress";
import type { Task } from "@/types/task.type";
import { taskService } from "@/services/task.services";

interface Props {
  task: Task;
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const { Text } = Typography;

const getPriorityConfig = (priority: 'low' | 'medium' | 'high') => {
  switch (priority) {
    case 'low':
      return { color: 'default', label: 'Thấp' };
    case 'medium':
      return { color: 'orange', label: 'Trung bình' };
    case 'high':
      return { color: 'red', label: 'Cao' };
    default:
      return { color: 'default', label: 'Trung bình' };
  }
};

export default function PriorityPicker({ task, open, onClose, onSave }: Props) {
  const qc = useQueryClient();
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>(
    task.priority || 'medium'
  );

  useEffect(() => {
    if (open) {
      setSelectedPriority(task.priority || 'medium');
    }
  }, [open, task.priority]);

  const updateMutation = useMutation({
    mutationFn: (priority: 'low' | 'medium' | 'high') =>
      taskService.update(task.id, { priority }),
    onSuccess: (updated: Task) => {
      onSave(updated);
      qc.invalidateQueries({ queryKey: ["columns"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["task", task.id] });
      if (projectId) {
        invalidateProgressQueries(qc, projectId);
        invalidateStatisticsQueries(qc, projectId);
      }
      message.success("Đã cập nhật mức độ ưu tiên");
      onClose();
    },
    onError: () => message.error("Lỗi khi cập nhật mức độ ưu tiên"),
  });

  const handleSave = () => {
    if (selectedPriority === task.priority) {
      onClose();
      return;
    }
    updateMutation.mutate(selectedPriority);
  };

  return (
    <Modal
      title="Mức độ ưu tiên"
      open={open}
      onCancel={onClose}
      footer={null}
      width={340}
      centered
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Radio.Group
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          style={{ width: "100%" }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Radio value="low">
              <Space>
                <Tag color="default">Thấp</Tag>
              </Space>
            </Radio>
            <Radio value="medium">
              <Space>
                <Tag color="orange">Trung bình</Tag>
              </Space>
            </Radio>
            <Radio value="high">
              <Space>
                <Tag color="red">Cao</Tag>
              </Space>
            </Radio>
          </Space>
        </Radio.Group>

        <Space style={{ width: "100%", marginTop: 10, justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            loading={updateMutation.isPending}
            onClick={handleSave}
          >
            Lưu
          </Button>
        </Space>
      </div>
    </Modal>
  );
}

