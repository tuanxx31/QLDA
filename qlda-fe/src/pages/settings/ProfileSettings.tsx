import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { App, Spin } from "antd";
import {
  ProForm,
  ProFormText,
  ProCard,
} from "@ant-design/pro-components";
import { getUserProfile, updateUserProfile } from "@/services/user.services";
import type { UpdateUserDto } from "@/types/user.type";

const ProfileSettings = () => {
  const { message } = App.useApp();

  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });

  const { mutateAsync: updateProfile, isPending } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      message.success("Cập nhật thông tin thành công!");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: () => message.error("Cập nhật thất bại, vui lòng thử lại."),
  });

  if (isLoading) return <Spin />;

  if (!user) return <div>Không tìm thấy thông tin cá nhân</div>;

  return (
    <ProCard title="Cập nhật thông tin cá nhân" bordered>
      <ProForm<UpdateUserDto>
        initialValues={user}
        onFinish={async (values) => {
          await updateProfile(values);
        }}
        submitter={{
          searchConfig: { submitText: "Lưu thay đổi" },
          resetButtonProps: false,
        }}
        loading={isPending}
      >
        <ProFormText
          name="name"
          label="Họ và tên"
          placeholder="Nhập họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        />

        <ProFormText
          name="email"
          label="Email"
          disabled
          tooltip="Không thể thay đổi email"
        />

        <ProFormText
          name="studentCode"
          label="Mã sinh viên"
          placeholder="Nhập mã sinh viên"
        />

        <ProFormText
          name="department"
          label="Khoa"
          placeholder="Nhập tên khoa"
        />
       
      </ProForm>
    </ProCard>
  );
};

export default ProfileSettings;
