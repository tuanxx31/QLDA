import { useState, useEffect, type ReactNode } from "react";
import { Modal, DatePicker, TimePicker, Button, Space, Typography, message } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
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
const getZeroTime = () => dayjs("00:00", "HH:mm");

export default function DueDateModal({ task, open, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    startDate: task.startDate ? dayjs(task.startDate) : null,
    startTime: task.startDate ? dayjs(task.startDate) : getZeroTime(),
    showStartPicker: !!task.startDate,

    dueDate: task.dueDate ? dayjs(task.dueDate) : null,
    dueTime: task.dueDate ? dayjs(task.dueDate) : getZeroTime(),

    repeat: (task as any).repeat ?? "never",
    remind: (task as any).remind ?? "none",
  });

  
  useEffect(() => {
    if (open) {
      setForm({
        startDate: task.startDate ? dayjs(task.startDate) : null,
        startTime: task.startDate ? dayjs(task.startDate) : getZeroTime(),
        showStartPicker: !!task.startDate,

        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        dueTime: task.dueDate ? dayjs(task.dueDate) : getZeroTime(),

        repeat: (task as any).repeat ?? "never",
        remind: (task as any).remind ?? "none",
      });
    }
  }, [open, task]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Task>) => taskService.update(task.id, payload),
    onSuccess: (updated: Task) => {
      message.success("Đã cập nhật thành công");
      onSave(updated);
    },
    onError: () => message.error("Lỗi khi cập nhật"),
  });

  const isDateInRange = (current: Dayjs) => {
    if (!form.startDate || !form.dueDate) return false;
    const currentValue = current.startOf("day").valueOf();
    const startValue = form.startDate.startOf("day").valueOf();
    const dueValue = form.dueDate.startOf("day").valueOf();
    return currentValue >= startValue && currentValue <= dueValue;
  };

  const renderRangeCell = (current: Dayjs): ReactNode => {
    const highlighted = isDateInRange(current);

    return (
      <div
        className="ant-picker-cell-inner"
        style={
          highlighted
            ? {
                backgroundColor: "rgba(22, 119, 255, 0.15)",
                borderRadius: 4,
                fontWeight: 600,
                color: "#1677ff",
              }
            : undefined
        }
      >
        {current.date()}
      </div>
    );
  };

  const handleStartDateChange = (value: Dayjs | null) => {
    if (!value) {
      setForm((f) => ({
        ...f,
        startDate: null,
        startTime: getZeroTime(),
        showStartPicker: false,
      }));
      return;
    }

    if (form.dueDate && value.isAfter(form.dueDate, "day")) {
      message.warning("Ngày bắt đầu không được lớn hơn ngày hết hạn");
      return;
    }
    setForm((f) => ({ ...f, startDate: value }));
  };

  const handleDueDateChange = (value: Dayjs | null) => {
    if (!value) {
      setForm((f) => ({
        ...f,
        dueDate: null,
        dueTime: getZeroTime(),
      }));
      return;
    }

    if (form.startDate && value.isBefore(form.startDate, "day")) {
      message.warning("Ngày hết hạn phải lớn hơn hoặc bằng ngày bắt đầu");
      return;
    }
    setForm((f) => ({ ...f, dueDate: value }));
  };

  const startDisabledDate = (current: Dayjs) => {
    if (!current || !form.dueDate) return false;
    return current.isAfter(form.dueDate, "day");
  };

  const dueDisabledDate = (current: Dayjs) => {
    if (!current || !form.startDate) return false;
    return current.isBefore(form.startDate, "day");
  };

  const handleSave = () => {
    
    let finalStart: string | null = null;
    if (form.startDate && form.startTime) {
      finalStart = dayjs(form.startDate)
        .hour(form.startTime.hour())
        .minute(form.startTime.minute())
        .second(0)
        .toISOString();
    }

    
    let finalDue: string | null = null;
    if (form.dueDate && form.dueTime) {
      finalDue = dayjs(form.dueDate)
        .hour(form.dueTime.hour())
        .minute(form.dueTime.minute())
        .second(0)
        .toISOString();
    }

    if (finalStart && finalDue && dayjs(finalStart).isAfter(dayjs(finalDue))) {
      message.warning("Ngày bắt đầu không được lớn hơn ngày hết hạn");
      return;
    }

    const payload: Partial<Task> = {
      startDate: finalStart,
      dueDate: finalDue,
      
    };

    updateMutation.mutate(payload);
    onClose();
  };

  return (
    <Modal title="Ngày" open={open} onCancel={onClose} footer={null} width={370} centered>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        
        {}
        <div>
          <Text strong>Ngày bắt đầu</Text>

          {form.showStartPicker ? (
            <Space style={{ marginTop: 8 }}>
              <DatePicker
                value={form.startDate}
                onChange={handleStartDateChange}
                disabledDate={startDisabledDate}
                dateRender={renderRangeCell}
                allowClear
              />
              <TimePicker
                value={form.startTime}
                onChange={(v) => setForm((f) => ({ ...f, startTime: v ?? getZeroTime() }))}
                format="HH:mm"
                disabled={!form.startDate}
              />
            </Space>
          ) : (
            <Button style={{ width: "100%", marginTop: 8 }} onClick={() => setForm((f) => ({ ...f, showStartPicker: true }))}>
              Thêm ngày bắt đầu
            </Button>
          )}
        </div>

        {}
        <div>
          <Text strong>Ngày hết hạn</Text>
          <Space style={{ marginTop: 8 }}>
            <DatePicker
              value={form.dueDate}
              onChange={handleDueDateChange}
              disabledDate={dueDisabledDate}
              dateRender={renderRangeCell}
              allowClear
            />
            <TimePicker
              value={form.dueDate ? form.dueTime : null}
              onChange={(v) => setForm((f) => ({ ...f, dueTime: v ?? getZeroTime() }))}
              format="HH:mm"
              disabled={!form.dueDate}
            />
          </Space>
        </div>

        <Space style={{ width: "100%", marginTop: 10, justifyContent: "flex-end" }}>
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
