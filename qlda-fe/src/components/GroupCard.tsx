import { ProCard } from "@ant-design/pro-components";
import {
  Typography,
  Space,
  Button,
  Tooltip,
  message,
  theme,
  Divider,
} from "antd";
import {
  KeyOutlined,
  TeamOutlined,
  CopyOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Group } from "@/types/group.type";

const { Text, Paragraph } = Typography;

export const GroupCard = ({ group }: { group: Group }) => {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      message.success("Đã sao chép mã mời!");
    } catch {
      message.error("Không thể sao chép mã mời");
    }
  };

  return (
    <ProCard
      key={group.id}
      hoverable
      ghost
      onClick={() => navigate(`/groups/${group.id}`)}
      style={{
        borderRadius: 20,
        background: token.colorBgContainer,
        boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.05)",
        transition: "all 0.25s ease",
        cursor: "pointer",
      }}
      bodyStyle={{
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Space align="center">
          <div
            style={{
              background: token.colorPrimaryBg,
              padding: 8,
              borderRadius: 10,
            }}
          >
            <TeamOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
          </div>
          <Text strong style={{ fontSize: 16 }}>
            {group.name}
          </Text>
        </Space>
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/groups/${group.id}`);
            }}
          />
        </Tooltip>
      </div>

      {/* Mô tả nhóm */}
      <Paragraph
        type="secondary"
        ellipsis={{ rows: 2 }}
        style={{
          minHeight: 48,
          marginTop: 10,
          fontSize: 13,
          color: token.colorTextSecondary,
        }}
      >
        {group.description || "Không có mô tả"}
      </Paragraph>

      <Divider style={{ margin: "10px 0" }} />

      {/* Mã mời */}
      <div
        style={{
          background: token.colorFillQuaternary,
          padding: "8px 12px",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Space>
          <KeyOutlined style={{ color: token.colorTextSecondary }} />
          <Text code>{group.inviteCode}</Text>
        </Space>
        <Tooltip title="Sao chép mã mời">
          <Button
            icon={<CopyOutlined />}
            type="text"
            size="small"
            onClick={handleCopy}
          />
        </Tooltip>
      </div>

      {/* Leader */}
      <div style={{ marginTop: 12, display: "flex", alignItems: "center" }}>
        <UserOutlined style={{ color: token.colorTextSecondary, marginRight: 6 }} />
        <Text type="secondary" style={{ fontSize: 13 }}>
          {group.leader?.name || group.leader?.email || "Chưa có nhóm trưởng"}
        </Text>
      </div>
    </ProCard>
  );
};
