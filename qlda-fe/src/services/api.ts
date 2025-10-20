// src/utils/api.ts
import axios from "axios";
import { API_BASE } from "@/utils/constants";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Hàm để inject Authorization header (token)
export const attachAuthToken = (authHeader: string | null) => {
  api.interceptors.request.use((config) => {
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }
    return config;
  });
};

// Response interceptor (xử lý lỗi 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register"
    ) {
      localStorage.removeItem("token_auth"); // có thể thay bằng clearAuth() nếu dùng react-auth-kit hoàn chỉnh
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export { api };
