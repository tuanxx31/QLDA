import { Button, Card, Input, Space, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function AddColumnCard({
  isAdding,
  setIsAdding,
  newName,
  setNewName,
  onAdd,
}: {
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
  newName: string;
  setNewName: (v: string) => void;
  onAdd: (name: string) => void;
}) {
  const { token } = theme.useToken();

  return (
    <Card
      style={{
        minWidth: 280,
        background: token.colorBgLayout,
        border: `1px dashed ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        textAlign: "center",
      }}
    >
      {isAdding ? (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Tên cột..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onPressEnter={() => newName && onAdd(newName)}
          />
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => newName && onAdd(newName)}
            >
              Thêm
            </Button>
            <Button size="small" onClick={() => setIsAdding(false)}>
              Hủy
            </Button>
          </Space>
        </Space>
      ) : (
        <Button
          icon={<PlusOutlined />}
          type="dashed"
          block
          onClick={() => setIsAdding(true)}
        >
          Thêm cột mới
        </Button>
      )}
    </Card>
  );
}
