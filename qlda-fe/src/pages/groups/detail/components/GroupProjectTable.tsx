import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/project.services';
import { ProTable } from '@ant-design/pro-components';
import { message, Popconfirm, Typography } from 'antd';
import type { Project } from '@/types/project.type';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
const { Text } = Typography;

const GroupProjectTable = ({ groupId }: { groupId: string }) => {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useQuery({
    queryKey: ['groupProjects', groupId],
    queryFn: async () => await projectService.getByGroupId(groupId),
  });

  const qc = useQueryClient();
  const removeMutation = useMutation({
    mutationFn: (id: string) => projectService.remove(id),
    onSuccess: () => {
      message.success('Đã xóa dự án');
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: () => {
      message.error('Không thể xóa dự án');
    },
  });
  return (
    <ProTable<Project>
      rowKey="id"
      loading={isLoading}
      search={false}
      pagination={{ pageSize: 8 }}
      dataSource={projects}
      columns={[
        {
          title: 'Tên dự án',
          dataIndex: 'name',
          render: (text, record) => (
            <Button
              type="link"
              onClick={() => navigate(`/projects/${record.id}`)}
              style={{ padding: 0 }}
            >
              {text}
            </Button>
          ),
        },
        {
          title: 'Mô tả',
          dataIndex: 'description',
          ellipsis: true,
        },
        {
          title: 'Trạng thái',
          dataIndex: 'status',
          align: 'center',
          render: (_, record) => (
            <Tag
              color={
                record.status === 'done' ? 'green' : record.status === 'doing' ? 'blue' : 'default'
              }
            >
              {record.status.toUpperCase()}
            </Tag>
          ),
        },
        {
          title: 'Ngày bắt đầu',
          dataIndex: 'startDate',
          render: (value) => {
            if (!value || value === null || value === undefined) {
              return <Text type="secondary">—</Text>;
            }
            try {
              return (
                <Text type="secondary">
                  {new Date(value as string).toLocaleDateString('vi-VN')}
                </Text>
              );
            } catch {
              return <Text type="secondary">—</Text>;
            }
          },
        },
        {
          title: 'Hạn chót',
          dataIndex: 'deadline',
          render: (value) => {
            if (!value || value === null || value === undefined) {
              return <Text type="secondary">—</Text>;
            }
            try {
              return (
                <Text type="secondary">
                  {new Date(value as string).toLocaleDateString('vi-VN')}
                </Text>
              );
            } catch {
              return <Text type="secondary">—</Text>;
            }
          },
        },
        {
          title: 'Trưởng dự án',
          dataIndex: ['manager', 'name'],
          render: name => name || '—',
        },
        {
          title: 'Hành động',
          dataIndex: 'actions',
          render: (_, record) => (
            <Popconfirm
              title="Xác nhận xóa dự án"
              onConfirm={() => removeMutation.mutate(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="link" danger>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          ),
        },
      ]}
      options={false}
      bordered
    />
  );
};

export default GroupProjectTable;
