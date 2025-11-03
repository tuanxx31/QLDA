import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';

interface AddMemberModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (email: string) => Promise<void> | void;
  loading?: boolean;
}

export const AddMemberModal = ({
  open,
  onCancel,
  onSubmit,
  loading,
}: AddMemberModalProps) => {
  return (
    <ModalForm<{ email: string }>
      title="Thêm thành viên vào nhóm"
      open={open}
      modalProps={{
        onCancel,
        destroyOnClose: true,
        confirmLoading: loading,
      }}
      onFinish={async values => {
        try {
          await onSubmit(values.email);
          message.success('Đã gửi lời mời thành công');
          return true; // đóng form
        } catch {
          message.error('Gửi lời mời thất bại');
          return false;
        }
      }}
    >
      <ProFormText
        name="email"
        label="Email thành viên"
        placeholder="Nhập email thành viên"
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không hợp lệ' },
        ]}
      />
    </ModalForm>
  );
};
