import { Modal, Button, Table, Input, Avatar, Tag, Space, Typography, message } from "antd";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { groupMemberService } from "@/services/group.services";
import { projectMemberService } from "@/services/project.services";
import type { ColumnsType } from "antd/es/table";
import { CheckOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  groupId: string;
  onSuccess?: () => void;
}

type MemberLike = {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;        // optional: group role, if có
  user?: { id: string; name?: string; email?: string; avatar?: string };
  joinedAt?: string;    // optional
};

const MemberAddFromGroupModal = ({ open, onClose, projectId, groupId, onSuccess }: Props) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(8);

  // 1) Lấy thành viên nhóm
  const { data: groupMembers, isLoading: loadingGroup } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => groupMemberService.getGroupMembers(groupId),
    enabled: open && !!groupId,
  });

  // 2) Lấy thành viên dự án để loại bỏ
  const { data: projectMembers, isLoading: loadingProjectMembers } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => projectMemberService.getProjectMebers(projectId),
    enabled: open && !!projectId,
  });

  // Clear state khi mở/đóng
  useEffect(() => {
    if (!open) {
      setSelectedRowKeys([]);
      setSearch("");
    }
  }, [open]);

  // Chuẩn hóa id đã có trong dự án
  const alreadyIds = useMemo(() => {
    return new Set((projectMembers ?? []).map((m: any) => m.user?.id || m.id));
  }, [projectMembers]);

  // Danh sách có thể chọn (lọc ra khỏi những người đã ở trong dự án)
  const selectable: MemberLike[] = useMemo(() => {
    const arr: MemberLike[] = (groupMembers ?? []).filter((m: any) => {
      const uid = m.user?.id || m.id;
      return uid && !alreadyIds.has(uid);
    });
    return arr.map((m: any) => {
      const uid = m.user?.id || m.id;
      return {
        id: uid,
        name: m.user?.name ?? m.name ?? "",
        email: m.user?.email ?? m.email ?? "",
        avatar: m.user?.avatar ?? m.avatar,
        role: m.role, // nếu API có
        joinedAt: m.joinedAt,
        user: m.user,
      };
    });
  }, [groupMembers, alreadyIds]);

  // Tìm kiếm theo tên/email
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return selectable;
    return selectable.filter((u) => {
      const inName = (u.name || "").toLowerCase().includes(q);
      const inMail = (u.email || "").toLowerCase().includes(q);
      return inName || inMail;
    });
  }, [selectable, search]);

  // DataSource cho Table
  const dataSource = useMemo(
    () => filtered.map((u) => ({ key: u.id, ...u })),
    [filtered]
  );

  const mutation = useMutation({
    mutationFn: (payload: { userIds: string[] }) =>
      projectMemberService.addMembers(projectId, payload),
    onSuccess: () => {
      message.success("Đã thêm thành viên vào dự án");
      onClose();
      onSuccess?.();
    },
  });

  const handleSubmit = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Hãy chọn ít nhất 1 thành viên");
      return;
    }
    await mutation.mutateAsync({ userIds: selectedRowKeys as string[] });
  };

  // “Chọn tất cả” theo dữ liệu đang lọc (và trang hiện tại hay toàn bộ?)
  // Ở đây mình chọn toàn bộ danh sách đang lọc (mọi trang).
  const handleSelectAllFiltered = () => {
    const allKeys = dataSource.map((x) => x.key as string);
    setSelectedRowKeys(allKeys);
  };

  const handleClearSelection = () => setSelectedRowKeys([]);

  const columns: ColumnsType<any> = [
    {
      title: "Thành viên",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.avatar} icon={!record.avatar && <UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{record.name || record.email}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Typography.Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Vai trò nhóm",
      dataIndex: "role",
      key: "role",
      width: 150,
      render: (role: string) =>
        role ? (
          <Tag icon={<TeamOutlined />} color="blue">
            {role}
          </Tag>
        ) : (
          <Tag>member</Tag>
        ),
    },
    {
      title: "Tham gia",
      dataIndex: "joinedAt",
      key: "joinedAt",
      width: 180,
      render: (v: string) =>
        v ? new Date(v).toLocaleString("vi-VN") : <Typography.Text type="secondary">—</Typography.Text>,
    },
  ];

  const loading = loadingGroup || loadingProjectMembers;

  return (
    <Modal
      open={open}
      title="Thêm thành viên từ nhóm"
      onCancel={onClose}
      width={720}
      destroyOnClose
      footer={[
        <Space key="left" style={{ marginRight: "auto" }}>
          <Button onClick={handleSelectAllFiltered} disabled={loading || dataSource.length === 0}>
            Chọn tất cả ({dataSource.length})
          </Button>
          <Button onClick={handleClearSelection} disabled={selectedRowKeys.length === 0}>
            Bỏ chọn
          </Button>
        </Space>,
        <Space key="right">
          <Typography.Text type="secondary">
            Đã chọn: <b>{selectedRowKeys.length}</b>
          </Typography.Text>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            loading={mutation.isPending}
            onClick={handleSubmit}
          >
            Thêm
          </Button>
        </Space>,
      ]}
    >
      <Space style={{ width: "100%", marginBottom: 12 }}>
        <Input.Search
          allowClear
          placeholder="Tìm theo tên hoặc email…"
          onSearch={(v) => setSearch(v)}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          style={{ maxWidth: 320 }}
        />
      </Space>

      <Table
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          // có thể thêm built-in selections nếu muốn:
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            {
              key: "select-filtered",
              text: "Chọn tất cả (đang lọc)",
              onSelect: handleSelectAllFiltered,
            },
            {
              key: "clear",
              text: "Bỏ chọn",
              onSelect: handleClearSelection,
            },
          ],
        }}
        columns={columns}
        dataSource={dataSource}
        pagination={{
          pageSize,
          showSizeChanger: true,
          onShowSizeChange: (_, size) => setPageSize(size),
          showTotal: (total) => `Tổng ${total} thành viên`,
        }}
        size="middle"
      />
    </Modal>
  );
};

export default MemberAddFromGroupModal;
