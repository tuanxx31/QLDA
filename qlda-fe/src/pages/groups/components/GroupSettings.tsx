import { ProCard, ProList } from "@ant-design/pro-components";
import { Popconfirm, Button, message } from "antd";
import { groupService } from "@/services/group.services";
import useAuth from "@/hooks/useAuth";
import {  useQueryClient } from "@tanstack/react-query";
import {  useNavigate } from "react-router-dom";
// giải tán nhóm và rời nhóm, nếu trưởng nhóm thì giải tán nhóm, nếu không thì rời nhóm
export const GroupSettings = ({ group, onDelete }: { group: any, onDelete: () => void }) => {
  const auth = useAuth();
  const isLeader = group.leader.id === auth.authUser?.id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const onUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["myGroups"] }).then(() => {
      message.success("Đã cập nhật danh sách nhóm");
      navigate("/groups");
    });
  };
  const onLeave = () => {
    groupService.leaveGroup({ groupId: group.id }).then(() => {
      onUpdate();
    });
  };
  return (
  <ProCard bordered style={{ borderRadius: 12 }}>
    <ProList
      dataSource={isLeader ? [{ title: "Giải tán nhóm", danger: true }] : [{ title: "Rời nhóm", danger: true }]}
      renderItem={(item) => (
        <Popconfirm
          title={item.title === "Giải tán nhóm" ? "Bạn có chắc chắn muốn giải tán nhóm không?" : "Bạn có chắc chắn muốn rời nhóm không?"}
          onConfirm={item.title === "Giải tán nhóm" ? onDelete : onLeave}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Button type="primary" danger>
            {item.title}
          </Button>
        </Popconfirm>
      )}
    />
  </ProCard>
);
};