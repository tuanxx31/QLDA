import { ProCard, ProTable } from "@ant-design/pro-components";
import { Space, Avatar, Tag, Popconfirm, Button, Typography, message, Skeleton } from "antd";
import { DeleteOutlined, CrownOutlined, LogoutOutlined } from "@ant-design/icons";
import { projectMemberService } from "@/services/project.services";
import { useMutation } from "@tanstack/react-query";
import type { ProjectMember } from "@/types/project.type";

const { Text } = Typography;

export const ProjectMembersTable = ({ projectMembers, projectId,isLeader, onUpdate }: { projectMembers?: ProjectMember[], projectId: string, isLeader: boolean, onUpdate: () => void }) => {


  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      projectMemberService.remove(projectId, memberId),
    onSuccess: () => {
      message.success("Đã xóa thành viên khỏi nhóm!");
      onUpdate();
    },
  });

  const transferLeaderMutation = useMutation({
    mutationFn: (memberId: string) =>
      projectMemberService.transferLeader(projectId, memberId),
    onSuccess: () => {
      message.success("Đã chuyển quyền trưởng nhóm!");
      onUpdate();
    },
  });
  

  return (
    <ProCard bordered style={{ borderRadius: 12 }}>
      <ProTable
        search={false}
        options={false}
        pagination={false}
        rowKey="id"
        dataSource={projectMembers || []}
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
                  member.id === projectMembers?.find((m: any) => m.role === "leader")?.id ? (
                    <Text type="secondary">—</Text>
                  ) : (
                    <Space>
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
                      {
                        member.status === "accepted" && (
                        <Popconfirm
                        title="Chuyển quyền trưởng nhóm?"
                        onConfirm={() => transferLeaderMutation.mutate(member.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                      >
                        <Button
                          type="text"
                          icon={<CrownOutlined />}
                        />
                      </Popconfirm>
                      )}
                      
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
