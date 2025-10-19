import { LockOutlined, MobileOutlined, UserOutlined } from "@ant-design/icons";
import {
  LoginFormPage,
  ProFormCheckbox,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, Divider, Space, Tabs, message, theme } from "antd";
import type { CSSProperties } from "react";
import { useCallback, useState } from "react";
import { login } from "../../../services/auth.service";
import { useNavigate } from "react-router";
type LoginType = "phone" | "account";

const iconStyles: CSSProperties = {
  color: "rgba(0, 0, 0, 0.2)",
  fontSize: "18px",
  verticalAlign: "middle",
  cursor: "pointer",
};

const LoginPage = () => {
  const [loginType, setLoginType] = useState<LoginType>("account");
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: any) => {
    try {
      const res = await login(values);
      if (res?.access_token) {
        messageApi.success("Đăng nhập thành công");
        localStorage.setItem("access_token", res.access_token);
        navigate("/");
        return true;
      }
      messageApi.error(res?.message || "Đăng nhập thất bại");
      return false;
    } catch (err: any) {
      messageApi.error(err?.response?.data?.message || "Có lỗi khi đăng nhập");
      // return false;
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
        backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
        backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
        title={loginType === "account" ? "Đăng nhập" : "Quên mật khẩu"}
        containerStyle={{
          backgroundColor: "rgba(0, 0, 0,0.65)",
          backdropFilter: "blur(4px)",
        }}
        onFinish={handleSubmit}
        submitter={{
          submitButtonProps: { loading },
        }}
        actions={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Divider plain>
              <span
                style={{
                  color: token.colorTextPlaceholder,
                  fontWeight: "normal",
                  fontSize: 14,
                }}
              >
                Quản lý dự án cho sinh viên
              </span>
            </Divider>
            <Space align="center" size={24}></Space>
          </div>
        }
      >
        <Tabs
          centered
          activeKey={loginType}
          onChange={(activeKey) => setLoginType(activeKey as LoginType)}
        >
          <Tabs.TabPane key={"account"} tab={"Đăng nhập"} />
          <Tabs.TabPane key={"phone"} tab={"Quên mật khẩu"} />
        </Tabs>
        {loginType === "account" && (
          <>
            <ProFormText
              name="username"
              fieldProps={{
                size: "large",
                prefix: (
                  <UserOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              placeholder={"Nhập email"}
              rules={[
                {
                  required: true,
                  message: "Nhập email!",
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: "large",
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              placeholder={"Nhập password"}
              rules={[
                {
                  required: true,
                  message: "Nhập password!",
                },
              ]}
            />
          </>
        )}
        {loginType === "phone" && (
          <>
            <ProFormText
              fieldProps={{
                size: "large",
                prefix: (
                  <MobileOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              name="mobile"
              placeholder={"Nhập email"}
            />
            {/* <ProFormCaptcha
              fieldProps={{
                size: "large",
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
              }}
              captchaProps={{
                size: "large",
              }}
              placeholder={"Nhập mã"}
              
              name="captcha"
              onGetCaptcha={async () => {
                message.success("获取验证码成功！验证码为：1234");
              }}
            /> */}
          </>
        )}
        <div
          style={{
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            Nhớ tài khoản
          </ProFormCheckbox>
        </div>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Button type="link" onClick={() => navigate("/register")}>
            Chưa có tài khoản? Đăng ký
          </Button>
        </div>
      </LoginFormPage>
    </div>
  );
};
export default LoginPage;
