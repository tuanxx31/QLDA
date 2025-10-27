import {
    ModalForm,
    ProFormText,
    ProFormDatePicker,
    ProFormSelect,
  } from "@ant-design/pro-components";
  import { projectService } from "@/services/project.services";
  import { groupService } from "@/services/group.services";
  import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
  import { message, Space } from "antd";
  import type { CreateProjectDto } from "@/types/project.type";
import type { Group } from "@/types/group.type";
  
  interface Props {
    open: boolean;
    onClose: () => void;
  }
  
  const ProjectFormModal = ({ open, onClose }: Props) => {
    const qc = useQueryClient();
  
    /** 🟢 Lấy danh sách nhóm của user để chọn */
    const { data: groups, isLoading } = useQuery({
      queryKey: ["groups", "for-project"],
      queryFn: groupService.getMyGroups, // giả sử backend có /groups/my
    });
  
    /** 🟢 Gọi API tạo dự án */
    const mutation = useMutation({
      mutationFn: projectService.create,
      onSuccess: () => {
        message.success("Tạo dự án thành công");
        qc.invalidateQueries({ queryKey: ["projects"] });
        onClose();
      },
    });
  
    return (
      <ModalForm<CreateProjectDto>
        title="Tạo dự án mới"
        open={open}
        modalProps={{ onCancel: onClose, destroyOnClose: true }}
        onFinish={async (values) => {
          await mutation.mutateAsync(values);
        }}
      >
        <ProFormText
          name="name"
          label="Tên dự án"
          placeholder="Nhập tên dự án"
          required
        />
        <ProFormText
          name="description"
          label="Mô tả"
          placeholder="Mô tả ngắn gọn"
        />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          options={[
            { label: "To Do", value: "todo" },
            { label: "Doing", value: "doing" },
            { label: "Done", value: "done" },
          ]}
          initialValue="todo"
        />
  
        {/* 🧩 Chọn nhóm */}
        <ProFormSelect
          name="groupId"
          label="Thuộc nhóm"
          placeholder="Chọn nhóm (hoặc để trống nếu dự án cá nhân)"
          fieldProps={{ loading: isLoading }}
          allowClear
          showSearch
          options={
            groups?.map((g: Group) => ({
              label: g.name,
              value: g.id,
            })) || []
          }
        />
  
        <Space direction="horizontal" style={{ width: "100%" }}>
          <ProFormDatePicker name="startDate" label="Ngày bắt đầu" />
          <ProFormDatePicker name="deadline" label="Hạn chót" />
        </Space>
      </ModalForm>
    );
  };
  
  export default ProjectFormModal;
  