import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/services/user.services";
import { Descriptions, Spin } from "antd";

const ProfilePage = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });

  
  if (isLoading) return <Spin />;
  
  if (!user) return <div>Không tìm thấy thông tin cá nhân</div>;
  
  return (
    <Descriptions title="Thông tin cá nhân" layout="vertical">
      <Descriptions.Item label="Họ tên">{user.name}</Descriptions.Item>
      <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
      <Descriptions.Item label="Mã sinh viên">{user.studentCode}</Descriptions.Item>
      <Descriptions.Item label="Khoa">{user.department}</Descriptions.Item>
      <Descriptions.Item label="Ngày tạo">{new Date(user.createdAt).toLocaleString()}</Descriptions.Item>
    </Descriptions>
  );
};

export default ProfilePage;
