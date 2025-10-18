import type { HttpError } from "@refinedev/core";
import axios from "axios";
import { message } from "antd";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000",
  timeout: 10000,
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            // Chỉ hiển thị toast và redirect nếu không đang ở trang login
            const currentPath = window.location.pathname;
            if (currentPath !== "/login") {
                message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                window.location.href = "/login";
            }
        }

        // Hiển thị toast cho các lỗi khác
        if (error.code === 'ECONNABORTED') {
            message.error("Kết nối timeout. Vui lòng thử lại!");
        } else if (!error.response) {
            message.error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!");
        } else if (error.response?.status >= 500) {
            message.error("Lỗi server. Vui lòng thử lại sau!");
        } else if (error.response?.status >= 400 && error.response?.status < 500) {
            // Chỉ hiển thị toast cho lỗi client nếu không phải 401 (đã xử lý ở trên)
            if (error.response?.status !== 401) {
                const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
                message.error(errorMessage);
            }
        }

        const customError: HttpError = {
            ...error,
            message: error.response?.data?.message || error.message || "Có lỗi xảy ra",
            statusCode: error.response?.status,
        };

        return Promise.reject(customError);
    }
);

export { axiosInstance };
