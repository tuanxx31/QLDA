import { Modal, Input, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { groupService } from "@/services/group.services";

interface Props {
  open: boolean;
  onClose: () => void;
  groupId: string;
  group?: { name: string; description?: string };
}

export const GroupEditModal = ({ open, onClose, groupId, group }: Props) => {
  const qc = useQueryClient();
  const [formState, setFormState] = useState({ name: "", description: "" });

  useEffect(() => {
    if (group) {
      setFormState({
        name: group.name || "",
        description: group.description || "",
      });
    }
  }, [group]);

  const mutation = useMutation({
    mutationFn: () =>
      groupService.updateGroup(groupId, {
        name: formState.name,
        description: formState.description,
      }),
    onSuccess: () => {
      message.success("Cập nhật nhóm thành công ✅");
      qc.invalidateQueries({ queryKey: ["groupDetail", groupId] });
      onClose();
    },
    onError: () => message.error("Lỗi khi cập nhật nhóm"),
  });

  const handleSubmit = () => {
    if (!formState.name.trim()) return message.warning("Tên nhóm không được trống");
    mutation.mutate();
  };

  return (
    <Modal
      title="Chỉnh sửa nhóm"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      confirmLoading={mutation.isPending}
    >
      <Input
        placeholder="Tên nhóm"
        value={formState.name}
        onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
        style={{ marginBottom: 12 }}
      />
      <Input.TextArea
        placeholder="Mô tả (tùy chọn)"
        value={formState.description}
        onChange={(e) =>
          setFormState((p) => ({ ...p, description: e.target.value }))
        }
        rows={3}
      />
    </Modal>
  );
};
