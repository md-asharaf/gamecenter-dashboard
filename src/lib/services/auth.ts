import { api } from "../api/api-client";
import { UpdateAdminRequest } from "../types/user";

export async function getMe() {
  const res = await api.get("/admins/me");
  return res.data.data;
}

export async function login(data: Record<string, string>) {
  const res = await api.post("/auth/login", data);
  return res.data.data;
}

export async function logout() {
  const res = await api.post("/auth/logout");
  return res.data.data;
}

export async function updatePassword(data: Pick<UpdateAdminRequest, "password">) {
  const res = await api.put("/admins/me/password", data);
  return res.data.data;
}
