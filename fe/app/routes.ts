import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "auth/pages/Login.tsx"),
  route("register", "auth/pages/Register.tsx"),
] satisfies RouteConfig;
