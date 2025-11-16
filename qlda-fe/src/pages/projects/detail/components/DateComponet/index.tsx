import { useState, useEffect } from "react";
import {
  Modal,
  DatePicker,
  TimePicker,
  Button,
  Space,
  Typography,
  message,
  Select,
} from "antd";
import dayjs from "dayjs";
import { useMutation } from "@tanstack/react-query";
import type { Task } from "@/types/task.type";
import { taskService } from "@/services/task.services";

interface Props {
  task: Task;
  open: boolean;
  onClose: () => void;
  onSave: (data: Task) => void;
}

const { Text } = Typography;

export default function DueDateModal({ task, open, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    startDate: task.startDate ? dayjs(task.startDate) : null,
    showStartPicker: !!task.startDate, // kiểm soát hiển thị datepicker
    dueDate: task.dueDate ? dayjs(task.dueDate) : dayjs(),
    dueTime: task.dueDate ? dayjs(task.dueDate) : dayjs("00:00", "HH:mm"),
    repeat: (task as any).repeat ?? "never",
    remind: (task as any).remind ?? "none",
  });

  useEffect(() => {
    if (open) {
      setForm({
        startDate: task.startDate ? dayjs(task.startDate) : null,
        showStartPicker: !!task.startDate,
        dueDate: task.dueDate ? dayjs(task.dueDate) : dayjs(),
        dueTime: task.dueDate ? dayjs(task.dueDate) : dayjs("00:00", "HH:mm"),
        repeat: (task as any).repeat ?? "never",
        remind: (task as any).remind ?? "none",
      });
    }
  }, [open, task]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Task>) => taskService.update(task.id, payload),
    onSuccess: (updated: Task) => {
      message.success("Đã cập nhật thành công");
      setForm({
        startDate: updated.startDate ? dayjs(updated.startDate) : null,
        showStartPicker: !!updated.startDate,
        dueDate: updated.dueDate ? dayjs(updated.dueDate) : dayjs(),
        dueTime: updated.dueDate ? dayjs(updated.dueDate) : dayjs("00:00", "HH:mm"),
        repeat: (updated as any).repeat ?? "never",
        remind: (updated as any).remind ?? "none",
      });
      onSave(updated);
    },
    onError: () => message.error("Lỗi khi cập nhật"),
  });

  const handleSave = () => {
    const finalDue = dayjs(form.dueDate)
      .hour(form.dueTime.hour())
      .minute(form.dueTime.minute())
      .second(0)
      .toISOString();

    const payload: Partial<Task> = {
      startDate: form.startDate ? dayjs(form.startDate).toISOString() : undefined as any,
      dueDate: finalDue ? dayjs(finalDue).toISOString() : undefined as any,
    };

    updateMutation.mutate(payload);
    onClose();
  };

  return (
    <Modal title="Ngày" open={open} onCancel={onClose} footer={null} width={370} centered>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Ngày bắt đầu */}
        <div>
          <Text strong>Ngày bắt đầu</Text>
          <div style={{ marginTop: 8 }}>
            {form.showStartPicker ? (
              <DatePicker
                value={form.startDate}
                onChange={(v) => setForm((f) => ({ ...f, startDate: v }))}
                style={{ width: "100%" }}
              />
            ) : (
              <Button onClick={() => setForm((f) => ({ ...f, showStartPicker: true }))}>
                Thêm ngày bắt đầu
              </Button>
            )}
          </div>
        </div>

        {/* Ngày hết hạn */}
        <div>
          <Text strong>Ngày hết hạn</Text>
          <Space style={{ marginTop: 8 }}>
            <DatePicker
              value={form.dueDate}
              onChange={(v) => setForm((f) => ({ ...f, dueDate: v }))}
            />
            <TimePicker
              value={form.dueTime}
              onChange={(v) => setForm((f) => ({ ...f, dueTime: v }))}
              format="HH:mm"
            />
          </Space>
        </div>

        {/* Định kỳ */}
        <div>
          <Text strong>Định kỳ</Text>
          <Select
            value={form.repeat}
            onChange={(v) => setForm((f) => ({ ...f, repeat: v }))}
            style={{ width: "100%", marginTop: 6 }}
            options={[
              { value: "never", label: "Không bao giờ" },
              { value: "daily", label: "Hàng ngày" },
              { value: "weekly", label: "Hàng tuần" },
              { value: "monthly", label: "Hàng tháng" },
            ]}
          />
        </div>

        {/* Nhắc nhở */}
        <div>
          <Text strong>Nhắc nhở</Text>
          <Select
            value={form.remind}
            onChange={(v) => setForm((f) => ({ ...f, remind: v }))}
            style={{ width: "100%", marginTop: 6 }}
            options={[
              { value: "none", label: "Không nhắc" },
              { value: "5m", label: "5 phút trước" },
              { value: "10m", label: "10 phút trước" },
              { value: "1h", label: "1 giờ trước" },
              { value: "1d", label: "1 ngày trước" },
            ]}
          />
        </div>

        {/* Footer */}
        <Space style={{ width: "100%", marginTop: 10, justifyContent: "flex-end" }}>
         
          <Button  type="primary" loading={updateMutation.isPending} onClick={handleSave}>
            Lưu
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
