import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Typography, Space, Empty, Skeleton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { groupService } from '@/services/group.services';
import { GroupCard } from '@/pages/groups/components/GroupCard';
import { GroupPendingList } from '@/pages/groups/components/GroupPendingList';
import { CreateGroupFormModal } from './components/CreateGroupFormModal';
import { useState } from 'react';

const { Title } = Typography;
const GroupsPage = () => {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const { data: groups, isLoading } = useQuery({
    queryKey: ['myGroups'],
    queryFn: groupService.getMyGroups,
  });

  return (
    <div style={{ padding: 24 }}>
      <GroupPendingList
        onUpdate={() => queryClient.invalidateQueries({ queryKey: ['myGroups'] })}
      />
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Nhóm của tôi
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenModal(true)}>
          Tạo nhóm
        </Button>
      </Space>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : groups && groups.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {groups.map(g => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      ) : (
        <Empty description="Bạn chưa tham gia nhóm nào" style={{ marginTop: 60 }} />
      )}

      <CreateGroupFormModal open={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
};

export default GroupsPage;
