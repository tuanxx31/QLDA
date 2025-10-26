import { api } from "./api";
import type { ChangePasswordDto, UpdateUserDto, UserProfile } from "@/types/user.type";

export const getUserProfile = async (): Promise<UserProfile>   => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const updateUserProfile = async (dto: UpdateUserDto): Promise<{ message: string }> => {
  const response = await api.put("/users/profile", dto);
  return response.data;
}
export const changePassword = async (dto: ChangePasswordDto): Promise<{ message: string }> => {
  const response = await api.put("/users/change-password", dto);
  return response.data;
}

export const deleteUser = async (): Promise<{ message: string }> => {
  const response = await api.delete("/users/delete");
  return response.data;
}