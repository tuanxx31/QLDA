import { axiosInstance } from '../utils/axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export const authService = {
  // Đăng nhập
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Đăng ký
  register: async (userData: RegisterRequest): Promise<User> => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Lấy thông tin user hiện tại (cần token)
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  },

  // Đăng xuất (chỉ xóa token khỏi localStorage)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Lưu token và user info
  saveAuthData: (token: string, user?: User) => {
    localStorage.setItem('token', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Lấy token từ localStorage
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Lấy user info từ localStorage
  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Kiểm tra xem user đã đăng nhập chưa
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};
