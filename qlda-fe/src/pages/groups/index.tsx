import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Skeleton, Card } from 'antd';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { groupService } from '@/services/group.services';
import { GroupCard } from '@/pages/groups/components/GroupCard';
import { GroupPendingList } from '@/pages/groups/components/GroupPendingList';
import { GroupPendingApprovalsList } from '@/pages/groups/components/GroupPendingApprovalsList';
import { CreateGroupFormModal } from './components/CreateGroupFormModal';
import { JoinGroupModal } from './components/JoinGroupModal';
import { useState } from 'react';
import { usePageContentHeight } from '@/hooks/usePageContentHeight';

const GroupsPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openJoinModal, setOpenJoinModal] = useState(false);
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
          key="join"
          icon={<TeamOutlined />}
          onClick={() => setOpenJoinModal(true)}
        >
          Tham gia nhóm
        </Button>,
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
        <GroupPendingList />
        <GroupPendingApprovalsList />

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
        <JoinGroupModal open={openJoinModal} onClose={() => setOpenJoinModal(false)} />
      </Card>
    </PageContainer>
  );
};

export default GroupsPage;
