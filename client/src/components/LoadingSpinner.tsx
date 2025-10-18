import { Spin } from 'antd';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Đang xử lý..." 
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <Spin size="large" />
      <p style={{ color: '#666', margin: 0 }}>{message}</p>
    </div>
  );
};
