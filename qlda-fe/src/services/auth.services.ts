import { api } from "./api";
import type { LoginResponse } from "@/types/user.type";

export interface LoginParams {
    email: string;
    password: string;
}

export const login = async ({email, password}: LoginParams): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
};