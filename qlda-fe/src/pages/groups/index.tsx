import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Empty, Skeleton, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { groupService } from '@/services/group.services';
import { GroupCard } from '@/pages/groups/components/GroupCard';
import { GroupPendingList } from '@/pages/groups/components/GroupPendingList';
import { CreateGroupFormModal } from './components/CreateGroupFormModal';
import { useState } from 'react';
import { usePageContentHeight } from '@/hooks/usePageContentHeight';

const GroupsPage = () => {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const { minHeight } = usePageContentHeight();
  const { data: groups, isLoading } = useQuery({
    queryKey: ['myGroups'],
    queryFn: groupService.getMyGroups,
  });

  return (
    <PageContainer
      title="Nhóm của tôi"
      extra={[
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpenModal(true)}
        >
          Tạo nhóm
        </Button>,
      ]}
      style={{ height: '100%' }}
    >
      <Card style={{ minHeight }}>
        <GroupPendingList
          onUpdate={() => queryClient.invalidateQueries({ queryKey: ['myGroups'] })}
        />

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
      </Card>
    </PageContainer>
  );
};

export default GroupsPage;
