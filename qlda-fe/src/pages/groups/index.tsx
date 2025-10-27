import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Button,
  Typography,
  Modal,
  Input,
  Space,
  Empty,
  message,
  Skeleton,
} from "antd";
import {
  PlusOutlined,
  KeyOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { groupService } from "@/services/group.services";
import { GroupCard } from "@/components/GroupCard";

const { Title, Text } = Typography;
const GroupsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
  
    const {
      data: groups,
      isLoading,
      refetch,
    } = useQuery({
      queryKey: ["myGroups"],
      queryFn: groupService.getMyGroups,
    });
  
    const [isModalOpen, setModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
  
    const createGroup = useMutation({
      mutationFn: () => groupService.createGroup({ name: groupName, description }),
      onSuccess: () => {
        message.success("Tạo nhóm thành công 🎉");
        queryClient.invalidateQueries({ queryKey: ["myGroups"] });
        setModalOpen(false);
        setGroupName("");
        setDescription("");
      },
      onError: () => message.error("Lỗi khi tạo nhóm"),
    });
  
    const handleSubmit = () => {
      if (!groupName.trim()) return message.warning("Vui lòng nhập tên nhóm");
      createGroup.mutate();
    };
  
    return (
      <div style={{ padding: 24 }}>
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Nhóm của tôi
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Tạo nhóm
          </Button>
        </Space>
  
        {/* Danh sách nhóm */}
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : groups && groups.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {groups.map((g) => (
              <GroupCard key={g.id}  group={g} />
            ))}
          </div>
        ) : (
          <Empty
            description="Bạn chưa tham gia nhóm nào"
            style={{ marginTop: 60 }}
          />
        )}
  
        {/* Modal tạo nhóm */}
        <Modal
          title="Tạo nhóm mới"
          open={isModalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleSubmit}
          confirmLoading={createGroup.isPending}
          okText="Tạo"
          cancelText="Hủy"
        >
          <Input
            placeholder="Tên nhóm"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Input.TextArea
            placeholder="Mô tả (tùy chọn)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </Modal>

        
      </div>
    );
};

export default GroupsPage;
