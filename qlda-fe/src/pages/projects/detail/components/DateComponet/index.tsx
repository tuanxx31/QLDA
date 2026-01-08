import { useState, useEffect } from "react";
import { Modal, DatePicker, TimePicker, Button, Space, Typography, message, Tag } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
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
  onSave: (data: Task) => void;
}

const { Text } = Typography;
const getZeroTime = () => dayjs("00:00", "HH:mm");

// Quick date options
const quickDates = [
  { label: "Hôm nay", getValue: () => dayjs() },
  { label: "Ngày mai", getValue: () => dayjs().add(1, "day") },
  { label: "Tuần sau", getValue: () => dayjs().add(1, "week") },
];

// Quick time options
const quickTimes = [
  { label: "8:00", value: dayjs("08:00", "HH:mm") },
  { label: "12:00", value: dayjs("12:00", "HH:mm") },
  { label: "17:00", value: dayjs("17:00", "HH:mm") },
  { label: "23:59", value: dayjs("23:59", "HH:mm") },
];

// Calculate duration between two dates with time
const getDuration = (start: Dayjs | null, startTime: Dayjs | null, end: Dayjs | null, endTime: Dayjs | null): string | null => {
  if (!start || !end) return null;

  // Combine date and time
  const startDateTime = start.hour(startTime?.hour() ?? 0).minute(startTime?.minute() ?? 0);
  const endDateTime = end.hour(endTime?.hour() ?? 0).minute(endTime?.minute() ?? 0);

  const diffMinutes = endDateTime.diff(startDateTime, "minute");
  if (diffMinutes < 0) return null;

  const days = Math.floor(diffMinutes / (24 * 60));
  const hours = Math.floor((diffMinutes % (24 * 60)) / 60);
  const minutes = diffMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ngày`);
  if (hours > 0) parts.push(`${hours} giờ`);
  if (minutes > 0) parts.push(`${minutes} phút`);

  return parts.length > 0 ? parts.join(" ") : "0 phút";
};

export default function DueDateModal({ task, open, onClose, onSave }: Props) {
  const qc = useQueryClient();
  const { projectId } = useParams<{ projectId: string }>();
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
      onSave(updated);
      qc.invalidateQueries({ queryKey: ["columns"] });
      if (projectId) {
        invalidateProgressQueries(qc, projectId);
        invalidateStatisticsQueries(qc, projectId);
      }
    },
    onError: () => message.error("Lỗi khi cập nhật"),
  });

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

  const handleQuickDate = (type: "start" | "due", date: Dayjs) => {
    if (type === "start") {
      handleStartDateChange(date);
      setForm((f) => ({ ...f, showStartPicker: true }));
    } else {
      handleDueDateChange(date);
    }
  };

  const handleQuickTime = (type: "start" | "due", time: Dayjs) => {
    if (type === "start") {
      setForm((f) => ({ ...f, startTime: time }));
    } else {
      setForm((f) => ({ ...f, dueTime: time }));
    }
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

  const duration = getDuration(form.startDate, form.startTime, form.dueDate, form.dueTime);

  return (
    <Modal
      title="Thiết lập thời gian"
      open={open}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 8 }}>
        {/* Duration info */}
        {duration && (
          <div style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            background: "#f5f5f5",
            borderRadius: 6
          }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            <Text type="secondary">Thời lượng: <Text strong>{duration}</Text></Text>
          </div>
        )}

        {/* Start Date Section */}
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>Ngày bắt đầu</Text>

          {form.showStartPicker ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Space wrap>
                <DatePicker
                  value={form.startDate}
                  onChange={handleStartDateChange}
                  disabledDate={startDisabledDate}
                  allowClear
                  placeholder="Chọn ngày"
                  style={{ width: 160 }}
                />
                <TimePicker
                  value={form.startTime}
                  onChange={(v) => setForm((f) => ({ ...f, startTime: v ?? getZeroTime() }))}
                  format="HH:mm"
                  disabled={!form.startDate}
                  placeholder="Giờ"
                  style={{ width: 100 }}
                />
              </Space>
              {/* Quick date buttons */}
              <Space size={[4, 4]} wrap>
                {quickDates.map((qd) => (
                  <Tag
                    key={qd.label}
                    style={{ cursor: "pointer", margin: 0 }}
                    onClick={() => handleQuickDate("start", qd.getValue())}
                  >
                    {qd.label}
                  </Tag>
                ))}
              </Space>
              {/* Quick time buttons */}
              {form.startDate && (
                <Space size={[4, 4]} wrap>
                  {quickTimes.map((qt) => (
                    <Tag
                      key={qt.label}
                      color={form.startTime?.format("HH:mm") === qt.label ? "blue" : undefined}
                      style={{ cursor: "pointer", margin: 0 }}
                      onClick={() => handleQuickTime("start", qt.value)}
                    >
                      {qt.label}
                    </Tag>
                  ))}
                </Space>
              )}
            </div>
          ) : (
            <Button
              type="dashed"
              block
              onClick={() => setForm((f) => ({ ...f, showStartPicker: true }))}
            >
              + Thêm ngày bắt đầu
            </Button>
          )}
        </div>

        {/* Due Date Section */}
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>Ngày hết hạn</Text>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Space wrap>
              <DatePicker
                value={form.dueDate}
                onChange={handleDueDateChange}
                disabledDate={dueDisabledDate}
                allowClear
                placeholder="Chọn ngày"
                style={{ width: 160 }}
              />
              <TimePicker
                value={form.dueDate ? form.dueTime : null}
                onChange={(v) => setForm((f) => ({ ...f, dueTime: v ?? getZeroTime() }))}
                format="HH:mm"
                disabled={!form.dueDate}
                placeholder="Giờ"
                style={{ width: 100 }}
              />
            </Space>
            {/* Quick date buttons */}
            <Space size={[4, 4]} wrap>
              {quickDates.map((qd) => (
                <Tag
                  key={qd.label}
                  style={{ cursor: "pointer", margin: 0 }}
                  onClick={() => handleQuickDate("due", qd.getValue())}
                >
                  {qd.label}
                </Tag>
              ))}
            </Space>
            {/* Quick time buttons */}
            {form.dueDate && (
              <Space size={[4, 4]} wrap>
                {quickTimes.map((qt) => (
                  <Tag
                    key={qt.label}
                    color={form.dueTime?.format("HH:mm") === qt.label ? "blue" : undefined}
                    style={{ cursor: "pointer", margin: 0 }}
                    onClick={() => handleQuickTime("due", qt.value)}
                  >
                    {qt.label}
                  </Tag>
                ))}
              </Space>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            loading={updateMutation.isPending}
            onClick={handleSave}
          >
            Lưu
          </Button>
        </div>
      </div>
    </Modal>
  );
}
