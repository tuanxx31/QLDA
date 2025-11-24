import { ProCard, ProTable } from '@ant-design/pro-components';
import { Space, Avatar, Tag, Popconfirm, Button, Typography, message } from 'antd';
import { DeleteOutlined, CrownOutlined } from '@ant-design/icons';
import { projectMemberService } from '@/services/project.services';
import { useMutation } from '@tanstack/react-query';
import type { ProjectMember } from '@/types/project.type';
import { getAvatarUrl } from '@/utils/avatarUtils';

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
            render: (_: any, member: any) =>
              member.role === 'leader' ? (
                <Tag color="gold" icon={<CrownOutlined />}>
                  Trưởng nhóm
                </Tag>
              ) : (
                <Tag color="blue">Thành viên</Tag>
              ),
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
                        <Popconfirm
                          title={`Chuyển quyền trưởng dự án cho ${member.user.name}?`}
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
