import { Modal, Input } from 'antd';
import { useState } from 'react';

export const AddMemberModal = ({
  open,
  onCancel,
  onSubmit,
  loading,
}: {
  open: boolean;
  onCancel: () => void;
  onSubmit: (email: string) => void;
  loading?: boolean;
}) => {
  const [email, setEmail] = useState('');

  return (
    <Modal
      title="Thêm thành viên vào nhóm"
      open={open}
      onCancel={onCancel}
      onOk={() => {
        onSubmit(email);
        setEmail('');
      }}
      okText="Gửi lời mời"
      confirmLoading={loading}
    >
      <Input
        placeholder="Nhập email thành viên"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
    </Modal>
  );
};
