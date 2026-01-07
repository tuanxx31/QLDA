import {
  ModalForm,
  ProFormText,
  ProFormDatePicker,
  ProFormSelect,
  type ProFormInstance,
} from '@ant-design/pro-components';
import { projectService } from '@/services/project.services';
import { groupService } from '@/services/group.services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message, Space } from 'antd';
import { useRef, useEffect, useCallback } from 'react';
import type { UpdateProjectDto, Project } from '@/types/project.type';
import type { Group } from '@/types/group.type';

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
  onUpdate: () => void;
}

const ProjectEditModal = ({ open, onClose, project, onUpdate }: Props) => {
  const qc = useQueryClient();
  const formRef = useRef<ProFormInstance<UpdateProjectDto>>(null);

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups', 'for-project'],
    queryFn: groupService.getMyGroups,
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateProjectDto) => projectService.update(project.id, data),
    onSuccess: () => {
      message.success('Cập nhật dự án thành công');
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['projects', project.id] });
      onUpdate();
      onClose();
    },
    onError: () => {
      message.error('Cập nhật dự án thất bại');
    },
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Chỉ submit khi nhấn Enter và không phải trong textarea hoặc select đang mở
    if (e.key === 'Enter' && !e.shiftKey) {
      const target = e.target as HTMLElement;
      // Không submit nếu đang trong textarea hoặc select dropdown đang mở
      if (
        target.tagName === 'TEXTAREA' ||
        target.closest('.ant-select-dropdown') ||
        target.closest('.ant-picker-dropdown')
      ) {
        return;
      }
      e.preventDefault();
      formRef.current?.submit();
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, handleKeyDown]);

  return (
    <ModalForm<UpdateProjectDto>
      formRef={formRef}
      title="Chỉnh sửa dự án"
      open={open}
      modalProps={{ onCancel: onClose, destroyOnClose: true }}
      initialValues={project}
      submitter={{
        searchConfig: {
          submitText: 'Cập nhật',
          resetText: 'Hủy',
        },
      }}
      onFinish={async values => {
        await mutation.mutateAsync({
          ...values,
          id: project.id,
        });
      }}
    >
      <ProFormText
        name="name"
        label="Tên dự án"
        placeholder="Nhập tên dự án"
        rules={[{ required: true, message: 'Vui lòng nhập tên dự án' }]}
      />
      <ProFormText name="description" label="Mô tả" placeholder="Mô tả ngắn gọn" />
      <ProFormSelect
        name="status"
        label="Trạng thái"
        options={[
          { label: 'Chưa bắt đầu', value: 'todo' },
          { label: 'Đang thực hiện', value: 'doing' },
          { label: 'Hoàn thành', value: 'done' },
        ]}
        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
      />

      <ProFormSelect
        name={['group', 'id']}
        label="Thuộc nhóm"
        placeholder="Chọn nhóm (hoặc để trống nếu dự án cá nhân)"
        fieldProps={{ loading: isLoading }}
        allowClear
        showSearch
        options={[
          {
            label: 'Cá nhân',
            value: null,
          },
          ...(groups?.map((g: Group) => ({
            label: g.name,
            value: g.id,
          })) || []),
        ]}
      />

      <Space direction="horizontal" style={{ width: '100%' }}>
        <ProFormDatePicker name="startDate" label="Ngày bắt đầu" />
        <ProFormDatePicker name="deadline" label="Hạn chót" />
      </Space>
    </ModalForm>
  );
};

export default ProjectEditModal;
