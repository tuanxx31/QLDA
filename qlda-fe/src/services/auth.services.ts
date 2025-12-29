import { api } from './api';
import { API_BASE } from '@/utils/constants';
import type { LoginResponse } from '@/types/user.type';

export interface LoginParams {
  email: string;
  password: string;
}

export const login = async ({ email, password }: LoginParams): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getGoogleAuthUrl = (): string => {
  return `${API_BASE}/auth/google`;
};
