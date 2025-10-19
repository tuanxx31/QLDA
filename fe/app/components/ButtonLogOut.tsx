import { useNavigate } from "react-router";
import { Button } from "antd";
export default function ButtonLogOut() {
  const navigate = useNavigate(); 

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };
  return (
    <Button type="primary" danger onClick={handleLogout}>
      Đăng xuất
    </Button>
  );
}
