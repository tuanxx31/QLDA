import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Divider, Tabs, Tooltip, message } from 'antd';
import { CopyOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { groupService } from '@/services/group.services';
import useAuth from '@/hooks/useAuth';
import { GroupInfoCard } from '@/pages/groups/components/GroupInfoCard';
import { GroupMembersTable } from '@/pages/groups/components/GroupMembersTable';
import { GroupSettings } from '@/pages/groups/components/GroupSettings';
import { AddMemberModal } from '@/pages/groups/components/AddMemberModal';
import GroupProjectTable from './components/GroupProjectTable';
import { GroupEditModal } from './components/GroupEditModal';

const GroupDetailPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const auth = useAuth();
  const currentUser = auth.authUser;
  const queryClient = useQueryClient();
  const [openEditGroup, setOpenEditGroup] = useState(false);

  const [openAddMember, setOpenAddMember] = useState(false);

  const {
    data: group,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['groupDetail', groupId],
    queryFn: () => groupService.getDetail(groupId!),
    enabled: !!groupId,
  });

  const isLeader = group?.leader?.id === currentUser?.id;

  const deleteGroupMutation = useMutation({
    mutationFn: () => groupService.deleteGroup(groupId!),
    onSuccess: () => {
      message.success('Đã giải tán nhóm!');
      navigate('/groups');
    },
    onError: () => message.error('Không thể giải tán nhóm'),
  });
  const leaveGroupMutation = useMutation({
    mutationFn: () => groupService.leaveGroup({ groupId: groupId! }),
    onSuccess: () => {
      message.success('Đã rời nhóm!');
      navigate('/groups');
    },
    onError: () => message.error('Không thể rời nhóm'),
  });

  const addMemberMutation = useMutation({
    mutationFn: (email: string) => groupService.inviteMember({ groupId: groupId!, email }),
    onSuccess: () => {
      message.success('Đã gửi lời mời thành công!');
      queryClient.invalidateQueries({ queryKey: ['groupDetail', groupId] });
      setOpenAddMember(false);
    },
    onError: () => message.error('Không thể thêm thành viên'),
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(group?.inviteCode || '');
      message.success('Đã sao chép mã mời!');
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
        isLeader && (
          <>
            <Button style={{ marginLeft: 8 }} onClick={() => setOpenEditGroup(true)}>
              Chỉnh sửa nhóm
            </Button>
            <Divider type="vertical" />
            <Button
              icon={<UserAddOutlined />}
              type="primary"
              onClick={() => setOpenAddMember(true)}
            >
              Thêm thành viên
            </Button>
          </>
        ),
      ]}
    >
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
                isLeader={isLeader}
                onUpdate={() =>
                  queryClient.invalidateQueries({
                    queryKey: ['groupDetail', groupId],
                  })
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
          ...(!isLeader
            ? [
                {
                  key: 'settings',
                  label: 'Cài đặt',
                  children: (
                    <GroupSettings group={group} onDelete={() => leaveGroupMutation.mutate()} />
                  ),
                },
              ]
            : []),
          ...(isLeader
            ? [
                {
                  key: 'settings',
                  label: 'Cài đặt',
                  children: (
                    <GroupSettings group={group} onDelete={() => deleteGroupMutation.mutate()} />
                  ),
                },
              ]
            : []),
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
    </PageContainer>
  );
};

export default GroupDetailPage;
