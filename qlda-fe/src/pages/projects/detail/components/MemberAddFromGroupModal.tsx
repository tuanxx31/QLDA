import { Modal, Form, Select, Button } from "antd";
import { useQuery, useMutation } from "@tanstack/react-query";
import { groupMemberService } from "@/services/group.services"; // cần API: getMembers(groupId)
import { projectMemberService } from "@/services/project.services";
interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  groupId: string;
  onSuccess?: () => void;
}

const MemberAddFromGroupModal = ({ open, onClose, projectId, groupId, onSuccess }: Props) => {
  const [form] = Form.useForm();

  // 1) Lấy danh sách thành viên nhóm
  const { data: groupMembers, isLoading: loadingGroup } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => groupMemberService.getGroupMembers(groupId),
    enabled: open && !!groupId,
  });

  // 2) Lấy danh sách thành viên đã có trong dự án để loại bỏ
  const { data: projectMembers, isLoading: loadingProjectMembers } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => projectMemberService.getProjectMebers(projectId),
    enabled: open && !!projectId,
  });

  const alreadyIds = new Set((projectMembers ?? []).map((m: any) => m.user?.id || m.id));
  const selectable = (groupMembers ?? []).filter((m: any) => !alreadyIds.has(m.user?.id || m.id));

  const mutation = useMutation({
    mutationFn: (payload: { userIds: string[] }) =>
      projectMemberService.addMembers(projectId, payload), // backend: POST /projects/:id/members { userIds: [...] }
    onSuccess: () => {
      form.resetFields();
      onClose();
      onSuccess?.();
    },
  });

  const handleSubmit = async () => {
    const { userIds } = await form.validateFields();
    await mutation.mutateAsync({ userIds });
  };

  return (
    <Modal
      open={open}
      title="Thêm thành viên từ nhóm"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Hủy</Button>,
        <Button
          key="ok"
          type="primary"
          loading={mutation.isPending}
          onClick={handleSubmit}
        >
          Thêm
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="userIds"
          label="Chọn thành viên nhóm"
          rules={[{ required: true, message: "Hãy chọn ít nhất 1 thành viên" }]}
        >
          <Select
            mode="multiple"
            loading={loadingGroup || loadingProjectMembers}
            placeholder="Chọn thành viên để thêm vào dự án"
            options={(selectable ?? []).map((m: any) => ({
              label: m.user?.name || m.name || m.email,
              value: m.user?.id || m.id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MemberAddFromGroupModal;
