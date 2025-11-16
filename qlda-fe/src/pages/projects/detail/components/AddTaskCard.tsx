import { Button, Input, Space, theme } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

interface Props {
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
  newTitle: string;
  setNewTitle: (v: string) => void;
  onAdd: (title: string) => void;
  loading?: boolean;
}

const MAX_TITLE_LENGTH = 255;

export default function AddTaskCard({
  isAdding,
  setIsAdding,
  newTitle,
  setNewTitle,
  onAdd,
  loading,
}: Props) {
  const { token } = theme.useToken();

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (trimmed) {
      onAdd(trimmed);
    }
  };

  if (!isAdding) {
    return (
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: token.colorBgContainer,
          paddingTop: 8,
          marginTop: 'auto',
        }}
      >
        <Button
          type="text"
          onClick={() => setIsAdding(true)}
          style={{
            width: '100%',
            textAlign: 'left',
            color: token.colorTextSecondary,
            padding: '8px 12px',
            height: 'auto',
            borderRadius: token.borderRadius,
            border: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = token.colorFillTertiary;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          + Thêm thẻ
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: token.colorBgContainer,
        paddingTop: 8,
        marginTop: 'auto',
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input.TextArea
          placeholder="Nhập tiêu đề cho thẻ này..."
          value={newTitle}
          onChange={e => {
            const value = e.target.value;
            if (value.length <= MAX_TITLE_LENGTH) {
              setNewTitle(value);
            }
          }}
          onPressEnter={e => {
            if (e.shiftKey) return;
            e.preventDefault();
            if (newTitle.trim()) {
              handleAdd();
            }
          }}
          disabled={loading}
          autoFocus
          autoSize={{ minRows: 2, maxRows: 4 }}
          status={!newTitle.trim() ? 'warning' : undefined}
          style={{
            resize: 'none',
          }}
          maxLength={MAX_TITLE_LENGTH}
        />
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            disabled={!newTitle.trim()}
            loading={loading}
            onClick={handleAdd}
          >
            Thêm
          </Button>
          <Button
            icon={<CloseOutlined />}
            size="small"
            onClick={() => {
              setIsAdding(false);
              setNewTitle('');
            }}
          >
            Hủy
          </Button>
        </Space>
      </Space>
    </div>
  );
}
