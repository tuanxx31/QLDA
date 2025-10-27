import { groupService } from "@/services/group.services";
import type { InviteGroupDto } from "@/types/group.type";
import { ProCard, ProList } from "@ant-design/pro-components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Space, Typography, message, Empty, Skeleton } from "antd";
import { CheckCircleOutlined, CloseOutlined, TeamOutlined } from "@ant-design/icons";
const { Text, Title } = Typography;

export const GroupPendingList = ({onUpdate}: {onUpdate: () => void}) => {
  const queryClient = useQueryClient();

  const { data: pendingInvites, isLoading } = useQuery({
    queryKey: ["pendingInvites"],
    queryFn: groupService.findPendingInvites,
  });

  const acceptMutation = useMutation({
    mutationFn: (groupId: string) => groupService.acceptInvite(groupId),
    onSuccess: () => {
      message.success("Đã tham gia nhóm!");
      queryClient.invalidateQueries({ queryKey: ["pendingInvites"] });
      queryClient.invalidateQueries({ queryKey: ["pendingInvites"] });
      onUpdate();
    },
    onError: () => message.error("Không thể chấp nhận lời mời"),
  });

  const rejectMutation = useMutation({
    mutationFn: (groupId: string) => groupService.rejectInvite(groupId),
    onSuccess: () => {
      message.info("Đã từ chối lời mời");
      queryClient.invalidateQueries({ queryKey: ["pendingInvites"] });
    },
    onError: () => message.error("Không thể từ chối lời mời"),
  });
  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 2 }} />;
    
  }

  if (pendingInvites && pendingInvites.length === 0) {
    return null;
  }

  return (
    <ProList<InviteGroupDto>
    loading={isLoading}
    dataSource={pendingInvites || []}
   
    metas={{
      title: {
        dataIndex: "groupName",
        render: (text, invite) => (
          <Space>
            <TeamOutlined style={{ color: "#1677ff" }} />

            <Text strong>Nhóm:{" "}{invite.groupName}</Text>
          </Space>
        ),
      },
      description: {
        render: (_, invite) => (
          <Space direction="vertical" size={2}>
            <Text type="secondary">Trưởng nhóm: {invite.leader.name}</Text>
            <Text type="secondary">
              Mời lúc: {new Date(invite.invitedAt).toLocaleString("vi-VN")}
            </Text>
          </Space>
        ),
      },
      actions: {
        render: (_, invite) => (
          <Space>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={acceptMutation.isPending}
              onClick={() => acceptMutation.mutate(invite.groupId)}
            >
              Chấp nhận
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              loading={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate(invite.groupId)}
            >
              Từ chối
            </Button>
          </Space>
        ),
      },
    }}
    rowKey="groupId"
    pagination={false}
    split
    bordered
    headerTitle={<Title level={3} style={{ margin: 0, alignItems: "center", justifyContent: "center" }}>Danh sách lời mời nhóm</Title>}
    style={{ borderRadius: 12, marginBottom: 16 }}
  />
  );
};
