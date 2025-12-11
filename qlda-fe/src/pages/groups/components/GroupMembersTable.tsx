import { ProCard, ProTable } from '@ant-design/pro-components';
import { Space, Avatar, Tag, Popconfirm, Button, Typography, message } from 'antd';
import { DeleteOutlined, CrownOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { groupService } from '@/services/group.services';
import { useMutation } from '@tanstack/react-query';
import { getAvatarUrl } from '@/utils/avatarUtils';

const { Text } = Typography;

export const GroupMembersTable = ({ group, isLeader, onUpdate }: any) => {
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => groupService.removeMember(group.id, memberId),
    onSuccess: () => {
      message.success('Đã xóa thành viên khỏi nhóm!');
      onUpdate();
    },
  });

  const transferLeaderMutation = useMutation({
    mutationFn: (memberId: string) => groupService.transferLeader(group.id, memberId),
    onSuccess: () => {
      message.success('Đã chuyển quyền trưởng nhóm!');
      onUpdate();
    },
  });

  const approveJoinRequestMutation = useMutation({
    mutationFn: (memberId: string) => groupService.approveJoinRequest(group.id, memberId),
    onSuccess: () => {
      message.success('Đã duyệt yêu cầu tham gia nhóm!');
      onUpdate();
    },
    onError: () => message.error('Không thể duyệt yêu cầu'),
  });

  const rejectJoinRequestMutation = useMutation({
    mutationFn: (memberId: string) => groupService.rejectJoinRequest(group.id, memberId),
    onSuccess: () => {
      message.success('Đã từ chối yêu cầu tham gia nhóm!');
      onUpdate();
    },
    onError: () => message.error('Không thể từ chối yêu cầu'),
  });

  return (
    <ProCard bordered style={{ borderRadius: 12 }}>
      <ProTable
        search={false}
        options={false}
        pagination={false}
        rowKey="id"
        dataSource={group?.members || []}
        columns={[
          {
            title: 'Thành viên',
            render: (_: any, member: any) => (
              <Space>
                <Avatar src={getAvatarUrl(member.avatar)} />
                <div>
                  <Text strong>{member.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {member.email}
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
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (_: any, member: any) => {
              const statusConfig: Record<string, { color: string; text: string }> = {
                accepted: { color: 'green', text: 'Đã tham gia' },
                pending_invite: { color: 'gold', text: 'Chờ xác nhận' },
                pending_approval: { color: 'orange', text: 'Chờ duyệt' },
                rejected: { color: 'red', text: 'Từ chối' },
              };
              const config = statusConfig[member.status] || { color: 'default', text: member.status };
              return <Tag color={config.color}>{config.text}</Tag>;
            },
          },
          {
            title: 'Ngày tham gia',
            dataIndex: 'joinedAt',
            render: (_: any, member: any) =>
              member.joinedAt
                ? new Date(member.joinedAt as string).toLocaleDateString('vi-VN')
                : '—',
          },

          ...(isLeader
            ? [
                {
                  title: 'Thao tác',
                  key: 'actions',
                  render: (_: any, member: any) => {
                    if (member.id === group.leader.id) {
                      return <Text type="secondary">—</Text>;
                    }

                    
                    if (member.status === 'pending_approval') {
                      return (
                        <Space>
                          <Popconfirm
                            title="Duyệt yêu cầu tham gia nhóm?"
                            onConfirm={() => approveJoinRequestMutation.mutate(member.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                          >
                            <Button
                              type="text"
                              icon={<CheckOutlined />}
                              style={{ color: '#52c41a' }}
                            />
                          </Popconfirm>
                          <Popconfirm
                            title="Từ chối yêu cầu tham gia nhóm?"
                            onConfirm={() => rejectJoinRequestMutation.mutate(member.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                          >
                            <Button type="text" danger icon={<CloseOutlined />} />
                          </Popconfirm>
                        </Space>
                      );
                    }

                    
                    return (
                      <Space>
                        <Popconfirm
                          title="Xóa thành viên này khỏi nhóm?"
                          onConfirm={() => removeMemberMutation.mutate(member.id)}
                          okText="Xác nhận"
                          cancelText="Hủy"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                        {member.status === 'accepted' && (
                          <Popconfirm
                            title="Chuyển quyền trưởng nhóm?"
                            onConfirm={() => transferLeaderMutation.mutate(member.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                          >
                            <Button type="text" icon={<CrownOutlined />} />
                          </Popconfirm>
                        )}
                      </Space>
                    );
                  },
                },
              ]
            : []),
        ]}
      />
    </ProCard>
  );
};
