import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginFormPage, ProFormText } from "@ant-design/pro-components";
import { Button, Form, message, theme } from "antd";
import { useNavigate } from "react-router";
import { register } from "../../../services/auth";

const RegisterPage = () => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: any) => {
    try {
      const res = await register(values);
  
      if (res?.id) {
        messageApi.success("Đăng ký thành công!");
        form.resetFields();
        navigate(`/login?register=true&email=${values.email}&password=${values.password}`);
      } else {
        messageApi.success("Thao tác thành công!");
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại!";
        messageApi.error(errorMsg);
    }
  };
  

  return (
    <div
      style={{
        backgroundColor: "white",
        height: "100vh",
      }}
    >
      {contextHolder}
      <LoginFormPage
        form={form}
        backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
        backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
        title="Đăng ký"
        subTitle="Tạo tài khoản mới để quản lý dự án"
        onFinish={handleSubmit}
        submitter={{ searchConfig: { submitText: "Đăng ký" } }}
        containerStyle={{
          backgroundColor: "rgba(0, 0, 0,0.65)",
          backdropFilter: "blur(4px)",
        }}
      >
        <ProFormText
          name="email"
          fieldProps={{
            size: "large",
            prefix: <UserOutlined style={{ color: token.colorText }} />,
          }}
          placeholder="Nhập email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        />

        <ProFormText.Password
          name="password"
          fieldProps={{
            size: "large",
            prefix: <LockOutlined style={{ color: token.colorText }} />,
          }}
          placeholder="Nhập mật khẩu"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự" },
          ]}
        />

        <ProFormText.Password
          name="confirmPassword"
          fieldProps={{
            size: "large",
            prefix: <LockOutlined style={{ color: token.colorText }} />,
          }}
          placeholder="Nhập lại mật khẩu"
          rules={[
            { required: true, message: "Vui lòng nhập lại mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu nhập lại không khớp!")
                );
              },
            }),
          ]}
        />

        {/* nút chuyển qua trang đăng nhập */}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Button type="link" onClick={() => navigate("/login")}>
            Đã có tài khoản? Đăng nhập
          </Button>
        </div>
      </LoginFormPage>
    </div>
  );
};

export default RegisterPage;
