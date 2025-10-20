import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import type { JSX } from "react";
export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
