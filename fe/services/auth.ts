import api from "../utils/axios";

export type RegisterDto = {
  name: string;
  email: string;
  password: string;
  avatar?: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

export async function register(data: RegisterDto) {
  const res = await api.post("/auth/register", data);
  return res.data;
}

export async function login(data: LoginDto) {
  try{
    const res = await api.post("/auth/login", data);
    return res.data; // { access_token, user }
  }catch(err){
    console.log("err", err);
    return null;
  }
  
}
