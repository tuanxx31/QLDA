// src/utils/api.ts
import axios from "axios";
import { API_BASE } from "@/utils/constants";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// // 👇 Dùng DEFAULT HEADER, KHÔNG tạo interceptor cho request
// export const setAuthHeader = (authHeader: string | null) => {
//   if (authHeader) {
//     console.log("[SET AUTH HEADER]", authHeader);
//     api.defaults.headers.common.Authorization = authHeader;
//   } else {
//     delete api.defaults.headers.common.Authorization;
//     console.log("[REMOVE AUTH HEADER]");
//   }
// };

api.interceptors.request.use((config) => {
  const inputToken = localStorage.getItem("token_auth") || "";
  const regex = /(ey[A-Za-z0-9._-]+)/;
  const match = inputToken.match(regex);
  const token = match?.[1];   // dùng optional chaining

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



// Response interceptor: 401 → về login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register"
    ) {
      // Đồng bộ với react-auth-kit: xoá tất cả storage liên quan nếu có
      localStorage.removeItem("token_auth");
      localStorage.removeItem("token"); // phòng hờ nếu từng dùng name khác
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);
