import axios from "axios";

// 🧱 Tạo axios instance
const api = axios.create({
  baseURL: "http://localhost:3000", // 👉 đổi thành URL backend thật của bạn
  timeout: 10000,
});

// 🧠 Gắn token vào header nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚫 Nếu token hết hạn → logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export { api };
