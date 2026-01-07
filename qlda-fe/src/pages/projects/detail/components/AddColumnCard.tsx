import { useEffect, useRef } from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Button, Input, Space, theme, type InputRef } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

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
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (isAdding) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isAdding]);

  const handleAdd = () => {
    if (newName.trim()) onAdd(newName.trim());
  };

  return (
    <ProCard
      className="add-column-card"
      bordered
      style={{
        minWidth: 280,
        width: 280,
        flexShrink: 0,
        alignSelf: 'flex-start',
        textAlign: 'center',
        borderStyle: 'dashed',
        background: token.colorBgContainer,
        borderColor: token.colorBorderSecondary,
        transition: 'all 0.2s ease',
        boxShadow: isAdding ? token.boxShadowSecondary : undefined,
      }}
      bodyStyle={{
        padding: isAdding ? 16 : 8,
      }}
    >
      {isAdding ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            ref={inputRef}
            placeholder="Tên cột..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onPressEnter={handleAdd}
            maxLength={50}
            status={!newName.trim() ? 'warning' : undefined}
          />
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              disabled={!newName.trim()}
              onClick={handleAdd}
            >
              Thêm
            </Button>
            <Button
              icon={<CloseOutlined />}
              size="small"
              onClick={() => {
                setNewName('');
                setIsAdding(false);
              }}
            >
              Hủy
            </Button>
          </Space>
        </Space>
      ) : (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          block
          onClick={() => setIsAdding(true)}
          style={{
            height: 40,
            fontWeight: 500,
          }}
        >
          Thêm cột mới
        </Button>
      )}
    </ProCard>
  );
}
