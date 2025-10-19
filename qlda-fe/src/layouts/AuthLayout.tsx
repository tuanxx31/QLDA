import { Outlet } from "react-router-dom";
import "@/styles/auth.css";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
}
