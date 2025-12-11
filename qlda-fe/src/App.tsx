import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import Dashboard from '@/pages/dashboard';
import PrivateOutlet from '@/components/PrivateRoute';
import SettingsPage from '@/pages/settings';
import GroupsPage from '@/pages/groups';
import GroupDetailPage from '@/pages/groups/detail';
import ProjectPage from '@/pages/projects';
import ProjectDetailPage from '@/pages/projects/detail';
import ProjectBoardPage from '@/pages/projects/detail/ProjectBoardPage';
import StatisticsPage from '@/pages/projects/detail/StatisticsPage';
import ForbiddenPage from '@/pages/errors/ForbiddenPage';
import '@ant-design/v5-patch-for-react-19';
import './styles/app.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<PrivateOutlet />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />

          <Route path="settings" element={<SettingsPage />} />

          <Route path="forbidden" element={<ForbiddenPage />} />

          <Route path="groups">
            <Route index element={<GroupsPage />} />
            <Route path=":groupId" element={<GroupDetailPage />} />
          </Route>

          <Route path="projects">
            <Route index element={<ProjectPage />} />
            <Route path=":projectId">
              <Route index element={<ProjectDetailPage />} />
              <Route path="board" element={<ProjectBoardPage />} />
              <Route path="statistics" element={<StatisticsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
