import { ProForm, ProFormText } from "@ant-design/pro-components";
import { Card, message } from "antd";
import { register } from "../../../services/auth";

export default function RegisterPage() {
  const onFinish = async (values: any) => {
    try {
      await register(values);
      message.success("Đăng ký thành công, hãy đăng nhập!");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
      <Card title="Đăng ký tài khoản" style={{ width: 400 }}>
        <ProForm onFinish={onFinish} submitter={{ searchConfig: { submitText: "Đăng ký" } }}>
          <ProFormText
            name="name"
            label="Tên"
            placeholder="Nhập tên của bạn"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          />
          <ProFormText
            name="email"
            label="Email"
            placeholder="example@email.com"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          />
          <ProFormText.Password
            name="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            rules={[{ required: true, min: 6, message: "Ít nhất 6 ký tự" }]}
          />
          <ProFormText
            name="avatar"
            label="Avatar (URL)"
            placeholder="https://i.pravatar.cc/150"
          />
        </ProForm>
      </Card>
    </div>
  );
}
