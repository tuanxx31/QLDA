import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/layouts/AppLayout";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Dashboard from "@/pages/dashboard";
import ProfilePage from "./pages/profile/ProfilePage";
import PrivateOutlet from "@/components/PrivateRoute";
import { attachAuthToken } from "./services/api";
import { useEffect } from "react";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
export default function App() {
  const authHeader = useAuthHeader();

  useEffect(() => {
    attachAuthToken(authHeader);
  }, [authHeader]);

  return (
    <AuthProvider>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<PrivateOutlet />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
