import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/layouts/AppLayout";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Dashboard from "@/pages/dashboard";
import PrivateOutlet from "@/components/PrivateRoute";
import { useEffect } from "react";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import SettingsPage from "./pages/settings";
import '@ant-design/v5-patch-for-react-19';
import { setAuthHeader } from "./services/api";
import GroupsPage from "./pages/groups";
import GroupDetailPage from "./pages/groups/GroupDetail";

export default function App() {
  const authHeader = useAuthHeader();

  useEffect(() => {
    setAuthHeader(authHeader);
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
            <Route path="settings" element={<SettingsPage />} />
            <Route path="groups" element={<GroupsPage />} >
              <Route path=":groupId" element={<GroupDetailPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
