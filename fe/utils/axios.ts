import axios, { type AxiosRequestHeaders } from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // đổi sang URL backend thật của bạn
  timeout: 10000,
});

// Request Interceptor: tự động gắn JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      (config.headers as AxiosRequestHeaders)["Authorization"] =
        `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");

      if (
        !window.location.pathname.includes("login") &&
        !window.location.pathname.includes("register")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
