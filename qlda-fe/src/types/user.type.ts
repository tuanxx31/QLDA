export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  studentCode: string;
  department: string;
  createdAt: Date;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export type UserProfile = User;
