import { groupService } from '@/services/group.services';
import type { PendingApprovalGroupDto } from '@/types/group.type';
import { ProList } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Space, Typography, Skeleton, Badge } from 'antd';
import { ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
const { Text, Title } = Typography;

export const GroupPendingApprovalsList = () => {
  const { data: pendingApprovals, isLoading } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: groupService.findPendingApprovals,
  });

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 2 }} />;
  }

  if (pendingApprovals && pendingApprovals.length === 0) {
    return null;
  }

  return (
    <ProList<PendingApprovalGroupDto>
      loading={isLoading}
      dataSource={pendingApprovals || []}
      metas={{
        title: {
          dataIndex: 'groupName',
          render: (_text, approval) => (
            <Space>
              <TeamOutlined style={{ color: '#faad14' }} />
              <Text strong>Nhóm: {approval.groupName}</Text>
            </Space>
          ),
        },
        description: {
          render: (_, approval) => (
            <Space direction="vertical" size={2}>
              <Text type="secondary">Trưởng nhóm: {approval.leader.name}</Text>
              <Text type="secondary">
                Gửi yêu cầu lúc: {new Date(approval.requestedAt).toLocaleString('vi-VN')}
              </Text>
            </Space>
          ),
        },
        actions: {
          render: () => (
            <Badge
              status="processing"
              text={
                <Space>
                  <ClockCircleOutlined />
                  <Text type="secondary">Đang chờ duyệt</Text>
                </Space>
              }
            />
          ),
        },
      }}
      rowKey="groupId"
      pagination={false}
      split
      bordered
      headerTitle={
        <Title level={3} style={{ margin: 0, alignItems: 'center', justifyContent: 'center' }}>
          Nhóm đang chờ duyệt
        </Title>
      }
      style={{ borderRadius: 12, marginBottom: 16 }}
    />
  );
};

