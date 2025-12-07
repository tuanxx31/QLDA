import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectMemberService } from '@/services/project.services';
import { message, Alert } from 'antd';
import type { CreateProjectMemberDto } from '@/types/project.type';
import { PROJECT_ROLE_OPTIONS } from '@/utils/roleUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

const MemberAddModal = ({ open, onClose, projectId }: Props) => {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: CreateProjectMemberDto) =>
      projectMemberService.addMember(projectId, values),
    onSuccess: () => {
      message.success('Đã thêm thành viên');
      qc.invalidateQueries({ queryKey: ['projectMembers', projectId] });
      // Invalidate task assignees để assignees cũ tự động hiển thị lại khi thành viên được thêm lại
      qc.invalidateQueries({ queryKey: ['taskAssignees'] });
      qc.invalidateQueries({ queryKey: ['task'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['columns'] });
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Không thể thêm thành viên';
      message.error(errorMessage);
    },
  });

  return (
    <ModalForm<CreateProjectMemberDto>
      title="Thêm thành viên vào dự án"
      open={open}
      onFinish={async values => {
        await mutation.mutateAsync(values);
      }}
      modalProps={{ onCancel: onClose, destroyOnClose: true }}
    >
      <ProFormText
        name="email"
        label="Email thành viên"
        placeholder="Nhập email thành viên cần thêm"
        rules={[{ required: true, message: 'Vui lòng nhập email' }]}
      />
      <ProFormSelect
        name="role"
        label="Vai trò"
        placeholder="Chọn vai trò"
        initialValue="viewer"
        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
        options={PROJECT_ROLE_OPTIONS}
      />
    </ModalForm>
  );
};

export default MemberAddModal;
