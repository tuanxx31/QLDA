import { LoginFormPage, ProFormText } from "@ant-design/pro-components";
import { message } from "antd";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();

  const handleSubmit = async (values: any) => {
    try {
      const res = await api.post("/auth/login", values);
      login(res.data.access_token);
      message.success("Đăng nhập thành công!");
      window.location.href = "/dashboard";
    } catch (err: any) {
      message.error(err.response?.data?.message || "Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <LoginFormPage
      title="Hệ thống quản lý dự án sinh viên 🎓"
      subTitle="Đăng nhập để bắt đầu"
      onFinish={handleSubmit}
    >
      <ProFormText
        name="email"
        label="Email"
        placeholder="Nhập email"
        rules={[{ required: true, message: "Vui lòng nhập email!" }]}
      />

      <ProFormText.Password
        name="password"
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
      />
    </LoginFormPage>
  );
}
