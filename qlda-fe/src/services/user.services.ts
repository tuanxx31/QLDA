import { api } from "./api";
import type { UserProfile } from "@/types/user.type";

export const getUserProfile = async (): Promise<UserProfile>   => {
  const response = await api.get("/users/profile");
  return response.data;
};