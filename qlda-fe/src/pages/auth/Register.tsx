import { LoginFormPage, ProFormText } from "@ant-design/pro-components";
import { App } from "antd";
import { api } from "@/services/api";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const {message} = App.useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      await api.post("/auth/register", values);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      message.error(err.response?.data?.message || "Đăng ký thất bại!");
    }
    finally{
      setIsSubmitting(false);
    }
  };

  return (
    <LoginFormPage
      title="Tạo tài khoản mới"
      subTitle="Dành cho sinh viên mới"
      onFinish={handleSubmit}
      submitter={{ searchConfig: { submitText: "Đăng ký" } }}
      loading={isSubmitting}
    >
      <ProFormText name="name" label="Họ tên" placeholder="Nguyễn Văn A" rules={[{ required: true }]} />
      <ProFormText name="email" label="Email" placeholder="abc@student.edu.vn" rules={[{ required: true }]} />
      <ProFormText.Password
        name="password"
        label="Mật khẩu"
        placeholder="Tối thiểu 6 ký tự"
        rules={[{ required: true }]}
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
      </div>
    </LoginFormPage>
  );
}
