import { Modal, Button, Table, Input, Avatar, Tag, Space, Typography, message, Select } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { groupMemberService } from '@/services/group.services';
import { projectMemberService } from '@/services/project.services';
import type { ColumnsType } from 'antd/es/table';
import { CheckOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { getProjectRoleLabel, PROJECT_ROLE_OPTIONS } from '@/utils/roleUtils';
import { useResponsiveModalWidth } from '@/hooks/useResponsiveModalWidth';

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
  role?: string;
  user?: { id: string; name?: string; email?: string; avatar?: string };
  joinedAt?: string;
};

const MemberAddFromGroupModal = ({ open, onClose, projectId, groupId, onSuccess }: Props) => {
  const queryClient = useQueryClient();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(8);
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'editor' | 'leader'>('viewer');

  useResponsiveModalWidth({
    xs: 320,
    sm: 480,
    md: 640,
    lg: 720,
    xl: 850,
    xxl: 900,
  });

  const { data: groupMembers, isLoading: loadingGroup } = useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => groupMemberService.getGroupMembers(groupId),
    enabled: open && !!groupId,
  });

  const { data: projectMembers, isLoading: loadingProjectMembers } = useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => projectMemberService.getProjectMebers(projectId),
    enabled: open && !!projectId,
  });

  useEffect(() => {
    if (!open) {
      setSelectedRowKeys([]);
      setSearch('');
      setSelectedRole('viewer');
    }
  }, [open]);

  const alreadyIds = useMemo(() => {
    return new Set((projectMembers ?? []).map((m: any) => m.user?.id || m.id));
  }, [projectMembers]);

  const selectable: MemberLike[] = useMemo(() => {
    const arr: MemberLike[] = (groupMembers ?? []).filter((m: any) => {
      const uid = m.user?.id || m.id;
      return uid && !alreadyIds.has(uid);
    });
    return arr.map((m: any) => {
      const uid = m.user?.id || m.id;
      return {
        id: uid,
        name: m.user?.name ?? m.name ?? '',
        email: m.user?.email ?? m.email ?? '',
        avatar: m.user?.avatar ?? m.avatar,
        role: m.role,
        joinedAt: m.joinedAt,
        user: m.user,
      };
    });
  }, [groupMembers, alreadyIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return selectable;
    return selectable.filter(u => {
      const inName = (u.name || '').toLowerCase().includes(q);
      const inMail = (u.email || '').toLowerCase().includes(q);
      return inName || inMail;
    });
  }, [selectable, search]);

  const dataSource = useMemo(() => filtered.map(u => ({ key: u.id, ...u })), [filtered]);

  const mutation = useMutation({
    mutationFn: (payload: { userIds: string[]; role?: 'viewer' | 'editor' | 'leader' }) =>
      projectMemberService.addMembers(projectId, payload),
    onSuccess: () => {
      message.success('Đã thêm thành viên vào dự án');
      queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
      
      queryClient.invalidateQueries({ queryKey: ['taskAssignees'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Không thể thêm thành viên vào dự án';
      message.error(errorMessage);
    },
  });

  const handleSubmit = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Hãy chọn ít nhất 1 thành viên');
      return;
    }
    await mutation.mutateAsync({ 
      userIds: selectedRowKeys as string[],
      role: selectedRole,
    });
  };

  const handleSelectAllFiltered = () => {
    const allKeys = dataSource.map(x => x.key as string);
    setSelectedRowKeys(allKeys);
  };

  const handleClearSelection = () => setSelectedRowKeys([]);

  const columns: ColumnsType<any> = [
    {
      title: 'Thành viên',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={getAvatarUrl(record.avatar)} icon={!record.avatar && <UserOutlined />} />
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
      title: 'Vai trò nhóm',
      dataIndex: 'role',
      key: 'role',
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
      title: 'Tham gia',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      width: 180,
      render: (v: string) =>
        v ? (
          new Date(v).toLocaleString('vi-VN')
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
  ];

  const loading = loadingGroup || loadingProjectMembers;

  return (
    <Modal
      open={open}
      title="Thêm thành viên từ nhóm"
      onCancel={onClose}
      width={{
        xs: 320,
        sm: 480,
        md: 640,
        lg: 720,
        xl: 850,
        xxl: 900,
      }}
      destroyOnClose
      footer={[
        <Space key="left" style={{ marginRight: 'auto' }}>
          <Button onClick={handleSelectAllFiltered} disabled={loading || dataSource.length === 0}>
            Chọn tất cả ({dataSource.length})
          </Button>
          <Button onClick={handleClearSelection} disabled={selectedRowKeys.length === 0}>
            Bỏ chọn
          </Button>
        </Space>,
        <Space key="right">
          <Typography.Text type="secondary">
            Đã chọn: <b>{selectedRowKeys.length}</b> • Vai trò: <b>{getProjectRoleLabel(selectedRole)}</b>
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
      <Space style={{ width: '100%', marginBottom: 12 }} direction="vertical" size="middle">
        <Space>
          <Input.Search
            allowClear
            placeholder="Tìm theo tên hoặc email…"
            onSearch={v => setSearch(v)}
            onChange={e => setSearch(e.target.value)}
            value={search}
            style={{ maxWidth: 320 }}
          />
        </Space>
        <Space>
          <Typography.Text strong>Vai trò cho tất cả thành viên được chọn:</Typography.Text>
          <Select
            value={selectedRole}
            onChange={(value) => setSelectedRole(value)}
            style={{ minWidth: 200 }}
            options={PROJECT_ROLE_OPTIONS}
          />
        </Space>
      </Space>

      <Table
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            {
              key: 'select-filtered',
              text: 'Chọn tất cả (đang lọc)',
              onSelect: handleSelectAllFiltered,
            },
            {
              key: 'clear',
              text: 'Bỏ chọn',
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
          showTotal: total => `Tổng ${total} thành viên`,
        }}
        size="middle"
      />
    </Modal>
  );
};

export default MemberAddFromGroupModal;
