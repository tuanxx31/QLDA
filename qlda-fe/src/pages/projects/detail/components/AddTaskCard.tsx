import { Button, Card, Input, Space, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface Props {
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
  newTitle: string;
  setNewTitle: (v: string) => void;
  onAdd: (title: string) => void;
  loading?: boolean;
}

export default function AddTaskCard({
  isAdding,
  setIsAdding,
  newTitle,
  setNewTitle,
  onAdd,
  loading,
}: Props) {
  const { token } = theme.useToken();

  if (!isAdding) {
    return (
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={() => setIsAdding(true)}
        style={{ marginTop: 8 }}
      >
        Thêm thẻ
      </Button>
    );
  }

  return (
    <Card
      size="small"
      style={{
        border: `1px dashed ${token.colorBorder}`,
        background: token.colorBgContainer,
        marginTop: 8,
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="Nhập tên thẻ..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onPressEnter={() => onAdd(newTitle)}
          disabled={loading}
        />
        <Space>
          <Button type="primary" size="small" loading={loading} onClick={() => onAdd(newTitle)}>
            Thêm
          </Button>
          <Button size="small" onClick={() => setIsAdding(false)}>
            Hủy
          </Button>
        </Space>
      </Space>
    </Card>
  );
}
