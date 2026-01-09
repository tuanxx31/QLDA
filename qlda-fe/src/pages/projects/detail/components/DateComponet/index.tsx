import { useState, useEffect } from "react";
import { Modal, DatePicker, Button, Space, Typography, message, Tag } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { RangePickerProps } from "antd/es/date-picker";
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
const { RangePicker } = DatePicker;


const quickDateRanges = [
  { 
    label: "Hôm nay", 
    getValue: () => [
      dayjs().hour(8).minute(0).second(0), 
      dayjs().hour(17).minute(0).second(0)
    ] as [Dayjs, Dayjs]
  },
  { 
    label: "Ngày mai", 
    getValue: () => [
      dayjs().add(1, "day").hour(8).minute(0).second(0), 
      dayjs().add(1, "day").hour(17).minute(0).second(0)
    ] as [Dayjs, Dayjs]
  },
  { 
    label: "Tuần này", 
    getValue: () => [
      dayjs().startOf("week").hour(8).minute(0).second(0), 
      dayjs().endOf("week").hour(17).minute(0).second(0)
    ] as [Dayjs, Dayjs]
  },
  { 
    label: "Tuần sau", 
    getValue: () => [
      dayjs().add(1, "week").startOf("week").hour(8).minute(0).second(0), 
      dayjs().add(1, "week").endOf("week").hour(17).minute(0).second(0)
    ] as [Dayjs, Dayjs]
  },
];


const quickTimePresets = [
  { label: "8:00", hour: 8, minute: 0 },
  { label: "12:00", hour: 12, minute: 0 },
  { label: "17:00", hour: 17, minute: 0 },
  { label: "23:59", hour: 23, minute: 59 },
];


const getDuration = (start: Dayjs | null, end: Dayjs | null): string | null => {
  if (!start || !end) return null;

  const diffMinutes = end.diff(start, "minute");
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
  
  const getInitialDateTimeRange = (): [Dayjs | null, Dayjs | null] => {
    const start = task.startDate ? dayjs(task.startDate) : null;
    const due = task.dueDate ? dayjs(task.dueDate) : null;
    return [start, due];
  };

  const [form, setForm] = useState({
    dateTimeRange: getInitialDateTimeRange() as [Dayjs | null, Dayjs | null],
    repeat: (task as any).repeat ?? "never",
    remind: (task as any).remind ?? "none",
  });

  useEffect(() => {
    if (open) {
      const start = task.startDate ? dayjs(task.startDate) : null;
      const due = task.dueDate ? dayjs(task.dueDate) : null;
      setForm({
        dateTimeRange: [start, due],
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

  const handleDateTimeRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates || !dates[0] || !dates[1]) {
      setForm((f) => ({
        ...f,
        dateTimeRange: [null, null],
      }));
      return;
    }

    const [start, due] = dates;
    if (start && due && start.isAfter(due)) {
      message.warning("Thời gian bắt đầu không được lớn hơn thời gian hết hạn");
      return;
    }

    setForm((f) => ({
      ...f,
      dateTimeRange: [start, due],
    }));
  };

  const handleQuickDateRange = (range: [Dayjs, Dayjs]) => {
    setForm((f) => ({
      ...f,
      dateTimeRange: range,
    }));
  };

  const handleQuickTime = (type: "start" | "due", hour: number, minute: number) => {
    const [start, due] = form.dateTimeRange;
    if (type === "start" && start) {
      setForm((f) => ({
        ...f,
        dateTimeRange: [start.hour(hour).minute(minute).second(0), f.dateTimeRange[1]],
      }));
    } else if (type === "due" && due) {
      setForm((f) => ({
        ...f,
        dateTimeRange: [f.dateTimeRange[0], due.hour(hour).minute(minute).second(0)],
      }));
    }
  };

  const disabledDate: RangePickerProps["disabledDate"] = (current) => {
    if (!current) return false;
    
    return false;
  };

  const handleSave = () => {
    const [startDateTime, dueDateTime] = form.dateTimeRange;
    
    let finalStart: string | null = null;
    if (startDateTime) {
      finalStart = startDateTime.second(0).millisecond(0).toISOString();
    }

    let finalDue: string | null = null;
    if (dueDateTime) {
      finalDue = dueDateTime.second(0).millisecond(0).toISOString();
    }

    if (finalStart && finalDue && dayjs(finalStart).isAfter(dayjs(finalDue))) {
      message.warning("Thời gian bắt đầu không được lớn hơn thời gian hết hạn");
      return;
    }

    const payload: Partial<Task> = {
      startDate: finalStart,
      dueDate: finalDue,
    };

    updateMutation.mutate(payload);
    onClose();
  };

  const duration = getDuration(form.dateTimeRange[0], form.dateTimeRange[1]);

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
        {}
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

        {}
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>Khoảng thời gian</Text>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <RangePicker
              showTime={{
                format: "HH:mm",
              }}
              format="DD/MM/YYYY HH:mm"
              value={form.dateTimeRange}
              onChange={handleDateTimeRangeChange}
              disabledDate={disabledDate}
              allowClear
              placeholder={["Ngày bắt đầu", "Ngày hết hạn"]}
              style={{ width: "100%" }}
            />

            {}
            <Space size={[4, 4]} wrap>
              {quickDateRanges.map((qdr) => (
                <Tag
                  key={qdr.label}
                  style={{ cursor: "pointer", margin: 0 }}
                  onClick={() => handleQuickDateRange(qdr.getValue())}
                >
                  {qdr.label}
                </Tag>
              ))}
            </Space>

            {}
            {form.dateTimeRange[0] && form.dateTimeRange[1] && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
                    Giờ bắt đầu nhanh
                  </Text>
                  <Space size={[4, 4]} wrap>
                    {quickTimePresets.map((qt) => (
                      <Tag
                        key={qt.label}
                        color={
                          form.dateTimeRange[0]?.hour() === qt.hour && 
                          form.dateTimeRange[0]?.minute() === qt.minute 
                            ? "blue" 
                            : undefined
                        }
                        style={{ cursor: "pointer", margin: 0 }}
                        onClick={() => handleQuickTime("start", qt.hour, qt.minute)}
                      >
                        {qt.label}
                      </Tag>
                    ))}
                  </Space>
                </div>

                <div>
                  <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
                    Giờ hết hạn nhanh
                  </Text>
                  <Space size={[4, 4]} wrap>
                    {quickTimePresets.map((qt) => (
                      <Tag
                        key={qt.label}
                        color={
                          form.dateTimeRange[1]?.hour() === qt.hour && 
                          form.dateTimeRange[1]?.minute() === qt.minute 
                            ? "blue" 
                            : undefined
                        }
                        style={{ cursor: "pointer", margin: 0 }}
                        onClick={() => handleQuickTime("due", qt.hour, qt.minute)}
                      >
                        {qt.label}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
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
