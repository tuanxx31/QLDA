import { changePassword } from "@/services/user.services";
import type { ChangePasswordDto } from "@/types/user.type";
import { App } from "antd";
import ProForm, { ProFormText } from "@ant-design/pro-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const { message } = App.useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: ChangePasswordDto) => {
    // check confirm password
    if (values.newPassword !== values.confirmPassword) {
      message.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }
    // check password length
    if (values.newPassword.length < 6) {
      message.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    // check password strength
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        values.newPassword
      )
    ) {
      message.error(
        "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ cái viết hoa, chữ cái viết thường, số và ký tự đặc biệt"
      );
      return;
    }
    // submit form
    setIsSubmitting(true);
    try {
      await changePassword(values);
      message.success("Mật khẩu đã được cập nhật thành công");
      navigate("/settings");
    } catch (err: any) {
      message.error(
        err.response?.data?.message || "Cập nhật mật khẩu thất bại"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProForm<ChangePasswordDto> onFinish={handleSubmit} loading={isSubmitting}>
      <ProFormText
        name="password"
        label="Mật khẩu hiện tại"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
      />
      <ProFormText
        name="newPassword"
        label="Mật khẩu mới"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
      />
      <ProFormText
        name="confirmPassword"
        label="Xác nhận mật khẩu"
        rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
      />
    </ProForm>
  );
};
export default ChangePassword;
