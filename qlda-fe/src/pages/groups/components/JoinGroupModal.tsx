import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { groupService } from '@/services/group.services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface JoinGroupModalProps {
  open: boolean;
  onClose: () => void;
}

export const JoinGroupModal = ({ open, onClose }: JoinGroupModalProps) => {
  const queryClient = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: (inviteCode: string) => groupService.joinByCode(inviteCode),
    onSuccess: () => {
      message.success('Đã gửi yêu cầu tham gia nhóm. Chờ trưởng nhóm duyệt');
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Không thể tham gia nhóm');
    },
  });

  return (
    <ModalForm<{ inviteCode: string }>
      title="Tham gia nhóm bằng mã mời"
      open={open}
      modalProps={{
        onCancel: onClose,
        destroyOnClose: true,
        confirmLoading: joinMutation.isPending,
      }}
      onFinish={async values => {
        try {
          await joinMutation.mutateAsync(values.inviteCode);
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText
        name="inviteCode"
        label="Mã mời"
        placeholder="Nhập mã mời nhóm"
        rules={[
          { required: true, message: 'Vui lòng nhập mã mời' },
          { min: 6, max: 6, message: 'Mã mời phải có 6 ký tự' },
        ]}
        fieldProps={{
          style: { textTransform: 'uppercase' },
          maxLength: 6,
        }}
      />
    </ModalForm>
  );
};

