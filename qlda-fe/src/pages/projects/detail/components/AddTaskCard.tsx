import { useState, useEffect } from 'react';
import { Button, Input, Space, theme, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

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
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isAdding) {
      setError('');
      return;
    }

    const trimmed = newTitle.trim();
    if (!trimmed) {
      setError('');
      return;
    }

    if (trimmed.length > MAX_TITLE_LENGTH) {
      setError(`Tiêu đề không được vượt quá ${MAX_TITLE_LENGTH} ký tự`);
    } else {
      setError('');
    }
  }, [newTitle, isAdding]);

  const validateAndSubmit = () => {
    const trimmed = newTitle.trim();
    
    if (!trimmed) {
      setError('Tiêu đề không được để trống');
      return;
    }

    if (trimmed.length > MAX_TITLE_LENGTH) {
      setError(`Tiêu đề không được vượt quá ${MAX_TITLE_LENGTH} ký tự`);
      return;
    }

    setError('');
    onAdd(newTitle);
  };

  if (!isAdding) {
    return (
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
    );
  }

  const trimmed = newTitle.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= MAX_TITLE_LENGTH;
  const remainingChars = MAX_TITLE_LENGTH - newTitle.length;

  return (
    <div
      style={{
        padding: '4px 0',
      }}
    >
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
          if (isValid) {
            validateAndSubmit();
          }
        }}
        disabled={loading}
        autoFocus
        autoSize={{ minRows: 2, maxRows: 4 }}
        status={error ? 'error' : ''}
        style={{
          marginBottom: 4,
          resize: 'none',
        }}
        maxLength={MAX_TITLE_LENGTH}
        showCount
      />
      {error && (
        <Text type="danger" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
          {error}
        </Text>
      )}
      {!error && newTitle.length > 0 && (
        <Text
          type="secondary"
          style={{
            fontSize: 12,
            display: 'block',
            marginBottom: 8,
            color: remainingChars < 20 ? token.colorWarning : token.colorTextSecondary,
          }}
        >
          {remainingChars >= 0
            ? `Còn ${remainingChars} ký tự`
            : `Vượt quá ${Math.abs(remainingChars)} ký tự`}
        </Text>
      )}
      <Space>
        <Button
          type="primary"
          size="small"
          loading={loading}
          disabled={!isValid}
          onClick={validateAndSubmit}
        >
          Thêm thẻ
        </Button>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={() => {
            setIsAdding(false);
            setNewTitle('');
            setError('');
          }}
          style={{
            color: token.colorTextSecondary,
          }}
        />
      </Space>
    </div>
  );
}
