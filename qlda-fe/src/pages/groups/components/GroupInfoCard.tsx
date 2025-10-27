import { ProCard, ProDescriptions } from "@ant-design/pro-components";
import { Space, Typography, Button } from "antd";
import {
  KeyOutlined,
  UserOutlined,
  CopyOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { theme } from "antd";

const { Text } = Typography;

export const GroupInfoCard = ({ group }: { group: any }) => {
  const { token } = theme.useToken();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(group?.inviteCode || "");
  };

  const memberPending = group?.members?.filter(
    (member: any) => member.status === "pending"
  );
  const memberAccepted = group?.members?.filter(
    (member: any) => member.status === "accepted"
  );

  return (
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
            {group?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="Mã mời">
            <Space>
              <KeyOutlined />
              <Text code>{group?.inviteCode}</Text>
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
                {group?.leader?.name ||
                  group?.leader?.email ||
                  "Không xác định"}
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
        <Space direction="horizontal" align="center">
        <Space direction="vertical" align="center">
          <TeamOutlined style={{ color: token.colorPrimary, fontSize: 22 }} />
          <Text strong>{memberAccepted?.length || 0}</Text>
          <Text type="secondary">Thành viên</Text>
        </Space>
        <Space direction="vertical" align="center">
          <TeamOutlined style={{ color: token.colorWarning, fontSize: 22 }} />
          <Text strong>{memberPending?.length || 0}</Text>
            <Text type="secondary">Chờ xác nhận</Text>
          </Space>
        </Space>
      </ProCard>
    </ProCard>
  );
};
