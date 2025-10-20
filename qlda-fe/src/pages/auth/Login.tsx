import { LoginFormPage, ProFormText } from "@ant-design/pro-components";
import useAuth from "@/hooks/useAuth";
import type { LoginParams } from "@/services/auth.services";
import { login as loginService } from "@/services/auth.services";
import { Link, useNavigate } from "react-router-dom";
import { App } from "antd";
import { useState } from "react";
import { setAuthHeader } from "@/services/api";

export default function Login() {

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const handleSubmit = async (values: LoginParams) => {
    setIsSubmitting(true);
    try {
      const res = await loginService(values);
      console.log(res);
      login(res.access_token, res.user);
      setAuthHeader(`Bearer ${res.access_token}`);
      message.success("Đăng nhập thành công!");
      navigate("/dashboard", { replace: true });
    } catch (err : any) {
      message.error(err.response?.data?.message || "Sai tài khoản hoặc mật khẩu!");
    }
    finally{
      setIsSubmitting(false);
    }
  };

  return (
    <LoginFormPage
      title="Hệ thống quản lý dự án sinh viên 🎓"
      subTitle="Đăng nhập để bắt đầu"
      onFinish={handleSubmit}
      loading={isSubmitting}
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
      {/* <ProFormCheckbox name="remember" label="Nhớ tôi" valuePropName="checked" /> */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <Link to="/register">Chưa có tài khoản? Đăng ký</Link>
        <Link to="/forgot-password">Quên mật khẩu?</Link>
      </div>
    </LoginFormPage>
  );
}
