import { Card, Button, Space } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';

interface TOCItem {
  id: string;
  label: string;
}

const TOC_ITEMS: TOCItem[] = [
  { id: 'statistics-overview', label: 'Tổng quan dự án' },
  { id: 'statistics-columns', label: 'Phân bố nhiệm vụ theo cột' },
  { id: 'statistics-members', label: 'Thống kê theo thành viên' },
  { id: 'statistics-deadlines', label: 'Thống kê hạn chót' },
  { id: 'statistics-timeline', label: 'Thống kê theo thời gian' },
  { id: 'statistics-comments', label: 'Thống kê bình luận' },
];

export default function StatisticsTOC() {
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card
      title={
        <Space>
          <UnorderedListOutlined />
          <span>Mục lục</span>
        </Space>
      }
      size="small"
    >
      <Space wrap size={[8, 8]}>
        {TOC_ITEMS.map((item) => (
          <Button
            key={item.id}
            type="link"
            onClick={() => handleScrollTo(item.id)}
            style={{ padding: '4px 8px' }}
          >
            {item.label}
          </Button>
        ))}
      </Space>
    </Card>
  );
}

