import { ProCard, ProTable } from "@ant-design/pro-components";
import { Space, Avatar, Tag, Popconfirm, Button, Typography } from "antd";
import { DeleteOutlined, CrownOutlined } from "@ant-design/icons";
import { groupService } from "@/services/group.services";
import { useMutation } from "@tanstack/react-query";

const { Text } = Typography;

export const GroupMembersTable = ({ group, isLeader, onRemoveSuccess }: any) => {
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      groupService.removeMember(group.id, memberId),
    onSuccess: () => {
      onRemoveSuccess();
    },
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
            title: "Thành viên",
            render: (_: any, member: any) => (
              <Space>
                <Avatar src={member.avatar} />
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
            title: "Vai trò",
            dataIndex: "role",
            render: (_: any, member: any) =>
              member.role === "leader" ? (
                <Tag color="gold" icon={<CrownOutlined />}>
                  Trưởng nhóm
                </Tag>
              ) : (
                <Tag color="blue">Thành viên</Tag>
              ),
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            render: (_: any, member: any) => (
              <Tag
                color={
                  member.status === "accepted"
                    ? "green"
                    : member.status === "pending"
                    ? "orange"
                    : "red"
                }
              >
                {member.status === "accepted"
                  ? "Đã tham gia"
                  : member.status === "pending"
                  ? "Chờ duyệt"
                  : "Từ chối"}
              </Tag>
            ),
          },
          {
            title: "Ngày tham gia",
            dataIndex: "joinedAt",
            render: (_: any, member: any) =>
              member.joinedAt ? new Date(member.joinedAt as string).toLocaleDateString("vi-VN") : "—",
          },
          ...(isLeader
            ? [
                {
                  title: "Thao tác",
                  key: "actions",
                  render: (_: any, member: any) =>
                    member.id === group.leader.id ? (
                      <Text type="secondary">—</Text>
                    ) : (
                      <Popconfirm
                        title="Xóa thành viên này khỏi nhóm?"
                        onConfirm={() => removeMemberMutation.mutate(member.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    ),
                },
              ]
            : []),
        ]}
      />
    </ProCard>
  );
};
