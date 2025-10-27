import {
  PageContainer,
  ProCard,
} from "@ant-design/pro-components";
import {
  Button,
  Divider,
  Tabs,
  Tooltip,
  message,
} from "antd";
import {
  CopyOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { groupService } from "@/services/group.services";
import useAuth from "@/hooks/useAuth";
import { GroupInfoCard } from "@/pages/groups/components/GroupInfoCard";
import { GroupMembersTable } from "@/pages/groups/components/GroupMembersTable";
import { GroupSettings } from "@/pages/groups/components/GroupSettings";
import { AddMemberModal } from "@/pages/groups/components/AddMemberModal";



const GroupDetailPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const auth = useAuth();
  const currentUser = auth.authUser;
  const queryClient = useQueryClient();

  const [openAddMember, setOpenAddMember] = useState(false);

  // 🔄 Lấy thông tin nhóm
  const { data: group, isLoading, isError } = useQuery({
    queryKey: ["groupDetail", groupId],
    queryFn: () => groupService.getDetail(groupId!),
    enabled: !!groupId,
  });

  const isLeader = group?.leader?.id === currentUser?.id;

  // 🧩 Mutation: Giải tán nhóm
  const deleteGroupMutation = useMutation({
    mutationFn: () => groupService.deleteGroup(groupId!),
    onSuccess: () => {
      message.success("Đã giải tán nhóm!");
      navigate("/groups");
    },
    onError: () => message.error("Không thể giải tán nhóm"),
  });

  // 🧩 Mutation: Thêm thành viên
  const addMemberMutation = useMutation({
    mutationFn: (email: string) => groupService.inviteMember({ groupId: groupId!, email }),
    onSuccess: () => {
      message.success("Đã gửi lời mời thành công!");
      queryClient.invalidateQueries({ queryKey: ["groupDetail", groupId] });
      setOpenAddMember(false);
    },
    onError: () => message.error("Không thể thêm thành viên"),
  });

  // 📋 Copy mã mời
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
      <PageContainer title="Không tìm thấy nhóm" onBack={() => navigate("/groups")}>
        Không thể tải thông tin nhóm hoặc nhóm không tồn tại.
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
        </Tooltip>,
        isLeader && (
          <>
            <Divider type="vertical" />
            <Button
              icon={<UserAddOutlined />}
              type="primary"
              onClick={() => setOpenAddMember(true)}
            >
              Thêm thành viên
            </Button>
          </>
        ),
      ]}
    >
      {/* Thông tin chung */}
      <GroupInfoCard group={group} />

      {/* Tabs */}
      <Tabs
        defaultActiveKey="members"
        style={{ marginTop: 24 }}
        items={[
          {
            key: "members",
            label: "Thành viên",
            children: (
              <GroupMembersTable
                group={group}
                isLeader={isLeader}
                onRemoveSuccess={() =>
                  queryClient.invalidateQueries({ queryKey: ["groupDetail", groupId] })
                }
              />
            ),
          },
          {
            key: "projects",
            label: "Dự án",
            children: (
              <ProCard bordered style={{ borderRadius: 12 }}>
                Danh sách dự án sẽ hiển thị tại đây.
              </ProCard>
            ),
          },
          ...(isLeader
            ? [
                {
                  key: "settings",
                  label: "Cài đặt",
                  children: (
                    <GroupSettings
                      onDelete={() => deleteGroupMutation.mutate()}
                    />
                  ),
                },
              ]
            : []),
        ]}
      />

      {/* Modal thêm thành viên */}
      <AddMemberModal
        open={openAddMember}
        onCancel={() => setOpenAddMember(false)}
        onSubmit={(email) => addMemberMutation.mutate(email)}
        loading={addMemberMutation.isPending}
      />
    </PageContainer>
  );
};

export default GroupDetailPage;
