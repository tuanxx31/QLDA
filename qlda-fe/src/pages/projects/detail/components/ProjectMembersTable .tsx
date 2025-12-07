import { ProCard, ProTable } from '@ant-design/pro-components';
import { Space, Avatar, Tag, Popconfirm, Button, Typography, message, Select, Tooltip } from 'antd';
import { DeleteOutlined, CrownOutlined } from '@ant-design/icons';
import { projectMemberService } from '@/services/project.services';
import { useMutation } from '@tanstack/react-query';
import type { ProjectMember } from '@/types/project.type';
import { getAvatarUrl } from '@/utils/avatarUtils';
import useAuth from '@/hooks/useAuth';
import { getProjectRoleLabel, getProjectRoleColor, PROJECT_ROLE_SIMPLE_OPTIONS } from '@/utils/roleUtils';

const { Text } = Typography;

export const ProjectMembersTable = ({
  projectMembers,
  projectId,
  isLeader,
  onUpdate,
}: {
  projectMembers?: ProjectMember[];
  projectId: string;
  isLeader: boolean;
  onUpdate: () => void;
}) => {
  const auth = useAuth();
  const currentUserId = auth.authUser?.id;

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => projectMemberService.remove(projectId, memberId),
    onSuccess: () => {
      message.success('Đã xóa thành viên khỏi nhóm!');
      onUpdate();
    },
  });

  const transferLeaderMutation = useMutation({
    mutationFn: (memberId: string) => projectMemberService.transferLeader(projectId, memberId),
    onSuccess: () => {
      message.success('Đã chuyển quyền trưởng dự án!');
      onUpdate();
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: 'viewer' | 'editor' | 'leader' }) =>
      projectMemberService.updateMemberRole(projectId, memberId, role),
    onSuccess: () => {
      message.success('Đã cập nhật vai trò thành viên!');
      onUpdate();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Không thể cập nhật vai trò';
      message.error(errorMessage);
    },
  });

  return (
    <ProCard bordered style={{ borderRadius: 12 }}>
      <ProTable<ProjectMember>
        search={false}
        options={false}
        pagination={false}
        rowKey="id"
        dataSource={projectMembers || []}
        columns={[
          {
            title: 'Thành viên',
            render: (_: any, member: any) => (
              <Space>
                <Avatar src={getAvatarUrl(member.user.avatar)} />
                <div>
                  <Text strong>{member.user.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {member.user.email}
                  </Text>
                </div>
              </Space>
            ),
          },
          {
            title: 'Vai trò',
            dataIndex: 'role',
            render: (_: any, member: any) => {
              const isCurrentUser = member.user?.id === currentUserId;
              const isMemberLeader = member.role === 'leader';
              const canChangeRole = isLeader && !isCurrentUser && !isMemberLeader;

              const renderTag = () => {
                if (member.role === 'leader') {
                  return (
                    <Tag color={getProjectRoleColor(member.role)} icon={<CrownOutlined />}>
                      {getProjectRoleLabel(member.role)}
                    </Tag>
                  );
                }
                return (
                  <Tag color={getProjectRoleColor(member.role)}>
                    {getProjectRoleLabel(member.role)}
                  </Tag>
                );
              };

              if (canChangeRole) {
                return (
                  <Select
                    value={member.role}
                    onChange={(value) =>
                      updateRoleMutation.mutate({ memberId: member.id, role: value })
                    }
                    loading={updateRoleMutation.isPending}
                    style={{ minWidth: 150 }}
                    options={PROJECT_ROLE_SIMPLE_OPTIONS}
                  />
                );
              }

              return renderTag();
            },
          },
          {
            title: 'Phòng ban',
            dataIndex: ['user', 'department'],
          },

          ...(isLeader
            ? [
                {
                  title: 'Thao tác',
                  key: 'actions',
                  render: (_: any, member: any) =>
                    member.id === projectMembers?.find((m: any) => m.role === 'leader')?.id ? (
                      <Text type="secondary">—</Text>
                    ) : (
                      <Space>
                        <Popconfirm
                          title="Xóa thành viên này khỏi nhóm?"
                          onConfirm={() => removeMemberMutation.mutate(member.id)}
                          okText="Xác nhận"
                          cancelText="Hủy"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                        <Tooltip title="Chuyển quyền trưởng dự án cho thành viên này. Mỗi dự án chỉ có 1 trưởng dự án.">
                          <Popconfirm
                            title={`Chuyển quyền trưởng dự án cho ${member.user.name}?`}
                            description="Bạn sẽ chuyển từ vai trò trưởng dự án sang biên tập viên, và thành viên này sẽ trở thành trưởng dự án mới."
                            onConfirm={() => transferLeaderMutation.mutate(member.user.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                          >
                            <Button
                              type="text"
                              icon={<CrownOutlined />}
                              loading={transferLeaderMutation.isPending}
                            />
                          </Popconfirm>
                        </Tooltip>
                      </Space>
                    ),
                },
              ]
            : []),
        ]}
      />
    </ProCard>
  );
};
