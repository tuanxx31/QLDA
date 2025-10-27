import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProTable,
} from "@ant-design/pro-components";
import {
  Button,
  Tabs,
  message,
  Space,
  Typography,
  Avatar,
  Tooltip,
  theme,
  Tag,
  Divider,
  Modal,
  Input,
} from "antd";
import {
  ArrowLeftOutlined,
  KeyOutlined,
  UserOutlined,
  TeamOutlined,
  CopyOutlined,
  CrownOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { groupService } from "@/services/group.services";
import { useState } from "react";

const { Text } = Typography;

const GroupDetailPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);
  // 🔄 Lấy thông tin nhóm
  const {
    data: group,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["groupDetail", groupId],
    queryFn: () => groupService.getDetail(groupId!),
    enabled: !!groupId,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(group?.inviteCode || "");
      message.success("Đã sao chép mã mời!");
    } catch {
      message.error("Không thể sao chép mã mời");
    }
  };


  if (isLoading) return <PageContainer loading />;
  if (isError || !group)
    return (
      <PageContainer
        title="Không tìm thấy nhóm"
        onBack={() => navigate("/groups")}
      >
        <Text>Không thể tải thông tin nhóm hoặc nhóm không tồn tại.</Text>
      </PageContainer>
    );


  return (
    <PageContainer
      title={group.name}
      subTitle={group.description || "Không có mô tả"}
      onBack={() => navigate("/groups")}
      extra={[
        <Tooltip title="Sao chép mã mời" key="copy">
          <Button icon={<CopyOutlined />} onClick={handleCopy}>
            Sao chép mã mời
          </Button>
          <Divider type="vertical" />
          <Button icon={<UserAddOutlined />} type="primary">
            Thêm thành viên
          </Button>
        </Tooltip>,
      ]}
    >
      {/* 📋 Thông tin nhóm */}
      <ProCard ghost gutter={16}>
        <ProCard
          title="Thông tin chung"
          colSpan="40%"
          bordered
          style={{ borderRadius: 12 }}
        >
          <ProDescriptions
            column={1}
            dataSource={group}
            labelStyle={{ fontWeight: 500 }}
          >
            <ProDescriptions.Item label="Tên nhóm">
              {group?.name || ""}
            </ProDescriptions.Item>

            <ProDescriptions.Item label="Mã mời">
              <Space>
                <KeyOutlined />
                <Text code>{group?.inviteCode || ""}</Text>
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={handleCopy}
                />
              </Space>
            </ProDescriptions.Item>

            <ProDescriptions.Item label="Trưởng nhóm">
              <Space>
                <UserOutlined />
                <Text>
                  {group?.leader?.name || group?.leader?.email || "Không xác định"}
                </Text>
              </Space>
            </ProDescriptions.Item>

            <ProDescriptions.Item label="Ngày tạo">
              {new Date(group?.createdAt || "").toLocaleString("vi-VN")}
            </ProDescriptions.Item>
          </ProDescriptions>
        </ProCard>

        <ProCard
          title="Tổng quan"
          colSpan="60%"
          bordered
          style={{ borderRadius: 12 }}
        >
          <Space size="large">
            <Space direction="vertical" align="center">
              <TeamOutlined style={{ color: token.colorPrimary, fontSize: 22 }} />
              <Text strong>{group?.members?.length || 0}</Text>
              <Text type="secondary">Thành viên</Text>
            </Space>
          </Space>
        </ProCard>
      </ProCard>

      {/* 📑 Tabs nội dung */}
      <Tabs
        defaultActiveKey="members"
        style={{ marginTop: 24 }}
        items={[
          {
            key: "members",
            label: "Thành viên",
            children: (
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
                      dataIndex: "name",
                      render: (_, member) => (
                        <Space>
                          <Avatar src={member.avatar} />
                          <div>
                            <Text strong>{member?.name || ""}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {member?.email || "" || "-"}
                            </Text>
                          </div>
                        </Space>
                      ),
                    },
                    {
                      title: "Vai trò",
                      dataIndex: "role",
                      render: (role) =>
                        role === "leader" ? (
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
                      render: (status) => (
                        <Tag
                          color={
                            status === "accepted"
                              ? "green"
                              : status === "pending"
                              ? "orange"
                              : "red"
                          }
                        >
                          {status === "accepted"
                            ? "Đã tham gia"
                            : status === "pending"
                            ? "Chờ duyệt"
                            : "Từ chối"}
                        </Tag>
                      ),
                    },
                    {
                      title: "Ngày tham gia",
                      dataIndex: "joinedAt",
                      render: (d) =>
                        d
                          ? new Date(d).toLocaleDateString("vi-VN")
                          : "—",
                    },
                  ]}
                />
              </ProCard>
            ),
          },
          {
            key: "projects",
            label: "Dự án",
            children: (
              <ProCard bordered style={{ borderRadius: 12 }}>
                <Text type="secondary">Danh sách dự án sẽ hiển thị tại đây.</Text>
              </ProCard>
            ),
          },
          {
            key: "settings",
            label: "Cài đặt",
            children: (
              <ProCard bordered style={{ borderRadius: 12 }}>
                <Text type="secondary">
                  Cấu hình nhóm (đổi tên, giải tán nhóm...) sẽ hiển thị tại đây.
                </Text>
              </ProCard>
            ),
          },
        ]}
      />
    </PageContainer>
  );
};

export default GroupDetailPage;
