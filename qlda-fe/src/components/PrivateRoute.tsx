// components/PrivateOutlet.tsx
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function PrivateOutlet({ fallbackPath = "/login" }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to={fallbackPath} replace />;
}
