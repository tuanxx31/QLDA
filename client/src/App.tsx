import { Refine, type AuthProvider, Authenticated } from "@refinedev/core";
import {
  useNotificationProvider,
  ThemedLayout,
  ErrorComponent,
  AuthPage,
  RefineThemes,
  ThemedTitle,
} from "@refinedev/antd";
import {
  GoogleOutlined,
  GithubOutlined,
  DashboardOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import viVN from "antd/locale/vi_VN";
import { appDataProvider } from "./utils/provider";

import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import { App as AntdApp, ConfigProvider, message } from "antd";

import "@ant-design/v5-patch-for-react-19";
import "@refinedev/antd/dist/reset.css";

import { PostList, PostEdit, PostShow } from "../src/pages/posts";
import { DashboardPage } from "../src/pages/dashboard";
import { API_URL } from "./utils/helper";
import {
  authService,
  type LoginRequest,
  type RegisterRequest,
} from "./services/auth";
import { SettingsView } from "./pages/settings";
import ProfileSettings from "./pages/settings/profile";
import Title from "antd/es/skeleton/Title";

console.log("API_URL", API_URL);

const App: React.FC = () => {
  const authProvider: AuthProvider = {
    login: async ({ providerName, email, password }) => {
      console.log("providerName", providerName);

      if (providerName === "google") {
        window.location.href = "https://accounts.google.com/o/oauth2/v2/auth";
        return {
          success: true,
        };
      }

      if (providerName === "github") {
        window.location.href = "https://github.com/login/oauth/authorize";
        return {
          success: true,
        };
      }

      if (email && password) {
        try {
          const loginData: LoginRequest = { email, password };
          const response = await authService.login(loginData);

          authService.saveAuthData(response.access_token);

          message.success("Đăng nhập thành công!");

          return {
            success: true,
            redirectTo: "/",
          };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Đăng nhập thất bại";

          return {
            success: false,
            error: {
              message: errorMessage,
              name: "Login failed",
            },
          };
        }
      }

      message.warning("Vui lòng nhập email và mật khẩu");

      return {
        success: false,
        error: {
          message: "Vui lòng nhập email và mật khẩu",
          name: "Missing credentials",
        },
      };
    },
    register: async (params) => {
      try {
        const registerData: RegisterRequest = {
          name: params.name || params.email.split("@")[0],
          email: params.email,
          password: params.password,
          avatar: params.avatar,
        };

        const user = await authService.register(registerData);

        message.success("Đăng ký tài khoản thành công!");

        const loginData: LoginRequest = {
          email: params.email,
          password: params.password,
        };
        const loginResponse = await authService.login(loginData);

        authService.saveAuthData(loginResponse.access_token, user);

        return {
          success: true,
          redirectTo: "/",
        };
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Đăng ký thất bại";

        return {
          success: false,
          error: {
            message: errorMessage,
            name: "Register failed",
          },
        };
      }
    },
    updatePassword: async (params) => {
      message.info("Chức năng đổi mật khẩu chưa được triển khai");
      return {
        success: false,
        error: {
          message: "Chức năng đổi mật khẩu chưa được triển khai",
          name: "Not implemented",
        },
      };
    },
    forgotPassword: async (params) => {
      message.info("Chức năng quên mật khẩu chưa được triển khai");
      return {
        success: false,
        error: {
          message: "Chức năng quên mật khẩu chưa được triển khai",
          name: "Not implemented",
        },
      };
    },
    logout: async () => {
      authService.logout();
      message.success("Đăng xuất thành công!");
      return {
        success: true,
        redirectTo: "/login",
      };
    },
    onError: async (error) => {
      if (error.response?.status === 401) {
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        }
        return {
          logout: true,
        };
      }

      return { error };
    },
    check: async () => {
      const isAuthenticated = authService.isAuthenticated();
      if (isAuthenticated) {
        return {
          authenticated: true,
        };
      } else {
        return {
          authenticated: false,
          error: {
            message: "Check failed",
            name: "Not authenticated",
          },
          logout: true,
          redirectTo: "/login",
        };
      }
    },
    getPermissions: async (params) => params?.permissions,
    getIdentity: async () => {
      const user = authService.getUser();
      if (user) {
        return {
          id: user.id,
          name: user.name,
          avatar:
            user.avatar ||
            "https://unsplash.com/photos/IWLOvomUmWU/download?force=true&w=640",
        };
      }
      return {
        id: 1,
        name: "User",
        avatar:
          "https://unsplash.com/photos/IWLOvomUmWU/download?force=true&w=640",
      };
    },
  };

  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue} locale={viVN}>
        <AntdApp>
          <Refine
            authProvider={authProvider}
            dataProvider={appDataProvider(API_URL)}
            routerProvider={routerProvider}
            resources={[
              {
                name: "dashboard",
                list: "/",
                meta: {
                  label: "Dashboard",
                  icon: <DashboardOutlined />,
                },
              },
              {
                name: "posts",
                list: "/posts",
                show: "/posts/show/:id",
                edit: "/posts/edit/:id",
              },
              {
                name: "settings",
                list: "/settings/profile", // ← Trang profile
                meta: {
                  label: "Cài đặt",
                  icon: <SettingOutlined  spin={false} />, // anh có thể đổi icon bên dưới
                },
              },
            ]}
            notificationProvider={useNotificationProvider}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated
                    key="authenticated-routes"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <ThemedLayout
                      Title={({ collapsed }) => (
                        <ThemedTitle
                          collapsed={collapsed}
                          // icon hiển thị bên trái (khi menu mở)
                          icon={
                            <DashboardOutlined style={{ color: "#1677ff" }} />
                          }
                          // text hiển thị khi menu chưa collapse
                          text={
                            <span
                              style={{
                                fontWeight: 700,
                                color: "#1677ff",
                                fontSize: 18,
                                letterSpacing: 0.5,
                              }}
                            >
                              Quản lý dự án
                            </span>
                          }
                        />
                      )}
                    >
                      <Outlet />
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="/settings">
                  <Route index element={<SettingsView />} />
                  <Route path="profile" element={<ProfileSettings />} />
                </Route>
                <Route path="/posts">
                  <Route index element={<PostList />} />
                  <Route path="edit/:id" element={<PostEdit />} />
                  <Route path="show/:id" element={<PostShow />} />
                </Route>
              </Route>

              <Route
                element={
                  <Authenticated key="auth-pages" fallback={<Outlet />}>
                    <NavigateToResource resource="posts" />
                  </Authenticated>
                }
              >
                <Route
                  path="/login"
                  element={
                    <AuthPage
                      type="login"
                      providers={[
                        {
                          name: "google",
                          label: "Sign in with Google",
                          icon: (
                            <GoogleOutlined
                              style={{
                                fontSize: 24,
                                lineHeight: 0,
                              }}
                            />
                          ),
                        },
                        // {
                        //   name: "github",
                        //   label: "Sign in with GitHub",
                        //   icon: (
                        //     <GithubOutlined
                        //       style={{
                        //         fontSize: 24,
                        //         lineHeight: 0,
                        //       }}
                        //     />
                        //   ),
                        // },
                      ]}
                    />
                  }
                />
                <Route
                  path="/register"
                  element={
                    <AuthPage
                      type="register"
                      providers={
                        [
                          // {
                          //   name: "google",
                          //   label: "Sign in with Google",
                          //   icon: (
                          //     <GoogleOutlined
                          //       style={{
                          //         fontSize: 24,
                          //         lineHeight: 0,
                          //       }}
                          //     />
                          //   ),
                          // },
                        ]
                      }
                    />
                  }
                />
                <Route
                  path="/forgot-password"
                  element={<AuthPage type="forgotPassword" />}
                />
                <Route
                  path="/update-password"
                  element={<AuthPage type="updatePassword" />}
                />
              </Route>

              <Route
                element={
                  <Authenticated key="catch-all">
                    <ThemedLayout>
                      <Outlet />
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
