import { Show } from "@refinedev/antd";
import { Card, Descriptions, Avatar, Typography, Row, Col } from "antd";
import { useCustom } from "@refinedev/core";
import dayjs from "dayjs";
import { IUser } from "../../interfaces";

const { Title, Text } = Typography;

export default function ProfileSettings() {
  const { query } = useCustom<IUser>({
    url: "/users/profile",
    method: "get",
  });

  const { data, isLoading } = query;
  const record = data?.data;

  return (
    <Show isLoading={isLoading} title="Thông tin cá nhân">
      <Card
        bordered={false}
        style={{
          maxWidth: 700,
          margin: "0 auto",
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          background: "#fff",
        }}
      >
        <Row justify="center" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Avatar
              src={record?.avatar}
              size={100}
              style={{ backgroundColor: "#1677ff", fontSize: 32 }}
            >
              {record?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Col>
        </Row>

        <Row justify="center" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ marginBottom: 0, textAlign: "center" }}>
              {record?.name || "Chưa có tên"}
            </Title>
            <Text type="secondary">{record?.email}</Text>
          </Col>
        </Row>

        <Descriptions
          title="Thông tin cá nhân"
          layout="vertical"
          bordered
          column={2}
          labelStyle={{ fontWeight: 600 }}
          contentStyle={{ background: "#fafafa" }}
        >
          <Descriptions.Item label="Mã sinh viên">
            {record?.studentCode || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Khoa / Bộ môn">
            {record?.department || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {record?.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo tài khoản">
            {record?.createdAt
              ? dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")
              : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Show>
  );
}
