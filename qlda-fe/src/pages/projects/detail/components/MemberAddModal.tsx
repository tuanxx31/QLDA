import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectMemberService } from '@/services/project.services';
import { message } from 'antd';
import type { CreateProjectMemberDto } from '@/types/project.type';

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
      onClose();
    },
    onError: () => message.error('Không thể thêm thành viên'),
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
        {/* <ProFormSelect
          name="role"
          label="Vai trò"
          placeholder="Chọn vai trò"
          rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          options={[
            { label: 'Viewer', value: 'viewer' },
            { label: 'Editor', value: 'editor' },
          ]}
        /> */}
    </ModalForm>
  );
};

export default MemberAddModal;
