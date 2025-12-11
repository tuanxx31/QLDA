import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Tabs, Tooltip, message, Card } from 'antd';
import { CopyOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { groupService } from '@/services/group.services';
import useAuth from '@/hooks/useAuth';
import { useGroupPermission } from '@/hooks/useGroupPermission';
import { GroupInfoCard } from '@/pages/groups/components/GroupInfoCard';
import { GroupMembersTable } from '@/pages/groups/components/GroupMembersTable';
import { GroupSettings } from '@/pages/groups/components/GroupSettings';
import { AddMemberModal } from '@/pages/groups/components/AddMemberModal';
import GroupProjectTable from './components/GroupProjectTable';
import { GroupEditModal } from './components/GroupEditModal';
import { usePageContentHeight } from '@/hooks/usePageContentHeight';
import { isForbiddenError } from '@/utils/errorHandler';

const GroupDetailPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const auth = useAuth();
  const currentUser = auth.authUser;
  const queryClient = useQueryClient();
  const [openEditGroup, setOpenEditGroup] = useState(false);
  const [openAddMember, setOpenAddMember] = useState(false);
  const { minHeight } = usePageContentHeight();
  const { data: group, isLoading, isError, error } = useQuery({
    queryKey: ['groupDetail', groupId],
    queryFn: () => groupService.getDetail(groupId!),
    enabled: !!groupId,
    retry: (failureCount, error) => {
      // Không retry nếu là lỗi 403
      if (isForbiddenError(error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (isError && isForbiddenError(error)) {
      navigate(`/forbidden?message=Bạn không có quyền truy cập nhóm này&from=group`);
    }
  }, [isError, error, navigate]);

  const { canEdit, canDelete, canInvite, canManageMembers } = useGroupPermission(groupId);

  const deleteGroupMutation = useMutation({
    mutationFn: () => groupService.deleteGroup(groupId!),
    onSuccess: () => {
      message.success('Đã giải tán nhóm');
      navigate('/groups');
    },
    onError: () => message.error('Không thể giải tán nhóm'),
  });

  const leaveGroupMutation = useMutation({
    mutationFn: () => groupService.leaveGroup({ groupId: groupId! }),
    onSuccess: () => {
      message.success('Đã rời nhóm');
      navigate('/groups');
    },
    onError: () => message.error('Không thể rời nhóm'),
  });

  const addMemberMutation = useMutation({
    mutationFn: (email: string) => groupService.inviteMember({ groupId: groupId!, email }),
    onSuccess: () => {
      message.success('Đã gửi lời mời thành công');
      queryClient.invalidateQueries({ queryKey: ['groupDetail', groupId] });
      setOpenAddMember(false);
    },
    onError: () => message.error('Không thể thêm thành viên'),
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(group?.inviteCode || '');
      message.success('Đã sao chép mã mời');
    } catch {
      message.error('Không thể sao chép mã mời');
    }
  };

  if (isLoading) return <PageContainer loading />;
  if (isError || !group)
    return (
      <PageContainer title="Không tìm thấy nhóm" onBack={() => navigate('/groups')}>
        Không thể tải thông tin nhóm hoặc nhóm không tồn tại.
      </PageContainer>
    );

  return (
    <PageContainer
      title={group.name}
      subTitle={group.description || 'Không có mô tả'}
      onBack={() => navigate('/groups')}
      extra={[
        <Tooltip title="Sao chép mã mời" key="copy">
          <Button icon={<CopyOutlined />} onClick={handleCopy}>
            Sao chép mã mời
          </Button>
        </Tooltip>,
        canEdit && (
          <Button key="edit" onClick={() => setOpenEditGroup(true)}>
            Chỉnh sửa nhóm
          </Button>
        ),
        canInvite && (
          <Button
            key="add"
            icon={<UserAddOutlined />}
            type="primary"
            onClick={() => setOpenAddMember(true)}
          >
            Thêm thành viên
          </Button>
        ),
      ]}
    >
      <Card style={{ minHeight }}>
        <GroupInfoCard group={group} />

        <Tabs
          defaultActiveKey="members"
          style={{ marginTop: 24 }}
          items={[
            {
              key: 'members',
              label: 'Thành viên',
              children: (
                <GroupMembersTable
                  group={group}
                  isLeader={canManageMembers}
                  onUpdate={() =>
                    queryClient.invalidateQueries({ queryKey: ['groupDetail', groupId] })
                  }
                />
              ),
            },
            {
              key: 'projects',
              label: 'Dự án',
              children: (
                <ProCard bordered style={{ borderRadius: 12 }}>
                  <GroupProjectTable groupId={groupId!} />
                </ProCard>
              ),
            },
            {
              key: 'settings',
              label: 'Cài đặt',
              children: (
                <GroupSettings
                  group={group}
                  onDelete={() =>
                    canDelete ? deleteGroupMutation.mutate() : leaveGroupMutation.mutate()
                  }
                />
              ),
            },
          ]}
        />

        <AddMemberModal
          open={openAddMember}
          onCancel={() => setOpenAddMember(false)}
          onSubmit={email => addMemberMutation.mutate(email)}
          loading={addMemberMutation.isPending}
        />

        <GroupEditModal
          open={openEditGroup}
          onClose={() => setOpenEditGroup(false)}
          groupId={groupId!}
          group={group}
        />
      </Card>
    </PageContainer>
  );
};

export default GroupDetailPage;
