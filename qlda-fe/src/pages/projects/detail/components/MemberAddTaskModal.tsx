import {
    Modal,
    Button,
    Table,
    Input,
    Space,
    Typography,
    message,
    Avatar,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckOutlined, UserOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { projectMemberService } from "@/services/project.services";
import { taskService } from "@/services/task.services";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateProgressQueries } from "@/utils/invalidateProgress";

interface Props {
    open: boolean;
    onClose: () => void;
    taskId: string;
    onSuccess?: () => void;
    currentAssignees?: string[]; // danh sách user đã có trong task (nếu có)
}

type MemberLike = {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
};

export default function MemberAddTaskModal({
    open,
    onClose,
    taskId,
    onSuccess,
    currentAssignees = [],
}: Props) {
    const { projectId } = useParams();
    const queryClient = useQueryClient();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(8);

    console.log({ projectId });

    const { data: projectMembers = [], isLoading } = useQuery({
        queryKey: ["projectMembers", projectId,taskId],
        queryFn: () => projectMemberService.getProjectMebers(projectId as string,taskId),
        enabled: open && !!projectId,
    });

    // Reset khi đóng modal
    useEffect(() => {
        if (!open) {
            setSelectedRowKeys([]);
            setSearch("");
        }
    }, [open]);

    const members: MemberLike[] = useMemo(() => {
        return projectMembers.map((m: any) => ({
            id: m.user?.id || m.id,
            name: m.user?.name ?? m.name ?? "",
            email: m.user?.email ?? m.email ?? "",
            avatar: m.user?.avatar ?? m.avatar,
        }));
    }, [projectMembers]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return members;
        return members.filter(
            (u) =>
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q)
        );
    }, [members, search]);

    const addMembersMutation = useMutation({
        mutationFn: (payload: { userIds: string[] }) =>
            taskService.assignUsers(taskId, { userIds: payload.userIds, labelIds: [] }),
        
        onSuccess: () => {
            message.success("Đã thêm thành viên vào công việc");
            queryClient.invalidateQueries({ queryKey: ["columns"] });
            if (projectId) {
                invalidateProgressQueries(queryClient, projectId);
            }
            onSuccess?.();
            onClose();
        },
        onError: () => {
            message.error("Lỗi khi thêm thành viên");
        },
    });

    const handleSelectAllFiltered = () => {
        const allKeys = filtered.map((x) => x.id);
        setSelectedRowKeys(allKeys);
    };

    const handleClearSelection = () => setSelectedRowKeys([]);

    const handleAddMembers = () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Hãy chọn ít nhất 1 thành viên để thêm vào công việc");
            return;
        }
        addMembersMutation.mutate({ userIds: selectedRowKeys as string[] });
    };

   
    const columns: ColumnsType<MemberLike> = [
        {
            title: "Thành viên",
            dataIndex: "email",
            key: "email",
            render: (_: string, record: MemberLike) => (
                <Space>
                    <Avatar
                        src={record.avatar}
                        icon={!record.avatar && <UserOutlined />}
                    />
                    <Space direction="vertical" size={0}>
                        <Typography.Text strong>
                            {record.name || record.email}
                        </Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {record.email}
                        </Typography.Text>
                    </Space>
                </Space>
            ),
        },
    ];

    const dataSource = filtered.map((u) => ({ key: u.id, ...u }));

    return (
        <Modal
            open={open}
            title="Thêm thành viên vào công việc"
            onCancel={onClose}
            width={650}
            destroyOnClose
            footer={[
                <Space key="left" style={{ marginRight: "auto" }}>
                    <Button
                        onClick={handleSelectAllFiltered}
                        disabled={isLoading || dataSource.length === 0}
                    >
                        Chọn tất cả ({dataSource.length})
                    </Button>
                    <Button
                        onClick={handleClearSelection}
                        disabled={selectedRowKeys.length === 0}
                    >
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
                        loading={addMembersMutation.isPending}
                        onClick={handleAddMembers}
                    >
                        Thêm
                    </Button>
                </Space>,
            ]}
        >
            <Space style={{ width: "100%", marginBottom: 12 }}>
                <Input.Search
                    allowClear
                    placeholder="Tìm theo tên hoặc email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: 320 }}
                />
            </Space>

            <Table
                loading={isLoading || addMembersMutation.isPending}
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                    getCheckboxProps: (record) => ({
                        disabled: currentAssignees.includes(record.id), // disable nếu đã gán
                    }),
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
}
