
import axios from 'axios';
import { message } from 'antd';
import { API_BASE } from '@/utils/constants';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const inputToken = localStorage.getItem('token_auth') || '';
  const regex = /(ey[A-Za-z0-9._-]+)/;
  const match = inputToken.match(regex);
  const token = match?.[1];

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  error => {
    // Xử lý lỗi 401 - Unauthorized
    if (
      error.response?.status === 401 &&
      window.location.pathname !== '/login' &&
      window.location.pathname !== '/register'
    ) {
      localStorage.removeItem('token_auth');
      window.location.assign('/login');
    }
    
    // Xử lý lỗi 403 - Forbidden
    if (error.response?.status === 403) {
      message.error('Bạn không có quyền truy cập trang này');
    }
    
    return Promise.reject(error);
  },
);
