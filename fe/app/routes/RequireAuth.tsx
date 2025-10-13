import { Navigate, Outlet } from "react-router";

export default function RequireAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
