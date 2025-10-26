import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GroupService } from "@/services/group.services";
import { Card, List, Avatar, Button, Space, Typography, Modal, Input, message } from "antd";
import { ArrowLeftOutlined, UserAddOutlined, SwapOutlined, LogoutOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: group, isLoading } = useQuery({
    queryKey: ["groupDetail", id],
    queryFn: () => GroupService.getDetail(id!),
  });

  const [isInviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const inviteMutation = useMutation({
    mutationFn: (email: string) =>
      GroupService.inviteMember({ groupId: id!, email }),
    onSuccess: () => {
      message.success("Đã gửi lời mời thành công");
      setInviteOpen(false);
      setInviteEmail("");
      queryClient.invalidateQueries({ queryKey: ["groupDetail", id] });
    },
    onError: () => message.error("Lỗi khi gửi lời mời"),
  });

  if (isLoading || !group)
    return <div style={{ padding: 24 }}>Đang tải thông tin nhóm...</div>;

  const isLeader =
    group.leader &&
    group.leader.id === localStorage.getItem("user_id"); // hoặc lấy từ context auth

  return (
    <div style={{ padding: 24 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/groups")}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>

      <Card>
        <Title level={3}>{group.name}</Title>
        <Text type="secondary">{group.description || "Không có mô tả"}</Text>

        <div style={{ marginTop: 12 }}>
          <Text strong>Mã mời:</Text> {group.inviteCode}
        </div>
        <div>
          <Text type="secondary">
            Trưởng nhóm: {group.leader?.name || group.leader?.email}
          </Text>
        </div>

        <Space style={{ marginTop: 16 }}>
          {isLeader && (
            <Button
              icon={<UserAddOutlined />}
              type="primary"
              onClick={() => setInviteOpen(true)}
            >
              Mời thành viên
            </Button>
          )}
        </Space>
      </Card>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>Thành viên</Title>
        <List
          itemLayout="horizontal"
          dataSource={group.members || []}
          renderItem={(member) => (
            <List.Item
              actions={
                isLeader && member.role !== "leader"
                  ? [
                      <Button
                        key="transfer"
                        icon={<SwapOutlined />}
                        size="small"
                        onClick={() =>
                          Modal.confirm({
                            title: "Chuyển quyền trưởng nhóm",
                            content: `Bạn có chắc muốn chuyển quyền cho ${member.name}?`,
                            onOk: async () => {
                              await groupService.transferLeader(group.id, member.id);
                              message.success("Đã chuyển quyền");
                              queryClient.invalidateQueries({
                                queryKey: ["groupDetail", id],
                              });
                            },
                          })
                        }
                      />,
                      <Button
                        key="remove"
                        icon={<LogoutOutlined />}
                        danger
                        size="small"
                        onClick={() =>
                          Modal.confirm({
                            title: "Xóa thành viên",
                            content: `Bạn có chắc muốn xóa ${member.name}?`,
                            onOk: async () => {
                              await groupService.removeMember(group.id, member.id);
                              message.success("Đã xóa thành viên");
                              queryClient.invalidateQueries({
                                queryKey: ["groupDetail", id],
                              });
                            },
                          })
                        }
                      />,
                    ]
                  : []
              }
            >
              <List.Item.Meta
                avatar={<Avatar src={member.avatar} />}
                title={
                  <Text strong>
                    {member.name}{" "}
                    {member.role === "leader" && (
                      <Text type="success">(Trưởng nhóm)</Text>
                    )}
                  </Text>
                }
                description={member.email}
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Mời thành viên vào nhóm"
        open={isInviteOpen}
        onCancel={() => setInviteOpen(false)}
        onOk={() => inviteMutation.mutate(inviteEmail)}
        okText="Gửi lời mời"
      >
        <Input
          placeholder="Nhập email thành viên"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
      </Modal>
    </div>
  );
}
