import { groupService } from '@/services/group.services';
import type { CreateGroupDto } from '@/types/group.type';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CreateGroupFormModal = ({ open, onClose }: Props) => {
  const queryClient = useQueryClient();
  const createGroup = useMutation({
    mutationFn: groupService.createGroup,
    onSuccess: () => {
      message.success('Tạo nhóm thành công');
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
      onClose();
    },
    onError: () => message.error('Lỗi khi tạo nhóm'),
  });

  return (
    <ModalForm<CreateGroupDto>
      title="Tạo nhóm mới"
      open={open}
      modalProps={{ onCancel: onClose, destroyOnClose: true }}
      onFinish={async values => {
        if (!values.name.trim()) return message.warning('Vui lòng nhập tên nhóm');
        await createGroup.mutateAsync(values);
      }}
    >
      <ProFormText name="name" label="Tên nhóm" placeholder="Nhập tên nhóm" required />
      <ProFormTextArea name="description" label="Mô tả" placeholder="Mô tả nhóm" />
    </ModalForm>
  );
};
