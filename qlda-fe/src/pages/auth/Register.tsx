import { LoginFormPage, ProFormText } from "@ant-design/pro-components";
import { message } from "antd";
import { api } from "@/services/api";

export default function Register() {
  const handleSubmit = async (values: any) => {
    try {
      await api.post("/auth/register", values);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      window.location.href = "/login";
    } catch (err: any) {
      message.error(err.response?.data?.message || "Đăng ký thất bại!");
    }
  };

  return (
    <LoginFormPage
      title="Tạo tài khoản mới"
      subTitle="Dành cho sinh viên mới"
      onFinish={handleSubmit}
      submitter={{ searchConfig: { submitText: "Đăng ký" } }}
    >
      <ProFormText name="name" label="Họ tên" placeholder="Nguyễn Văn A" rules={[{ required: true }]} />
      <ProFormText name="email" label="Email" placeholder="abc@student.edu.vn" rules={[{ required: true }]} />
      <ProFormText.Password
        name="password"
        label="Mật khẩu"
        placeholder="Tối thiểu 6 ký tự"
        rules={[{ required: true }]}
      />
    </LoginFormPage>
  );
}
