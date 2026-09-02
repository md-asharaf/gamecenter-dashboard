import { api } from "../api/api-client";
import { CreateAdminRequest, UpdateAdminRequest, User } from "../types/user";
import { PageResponse } from "../types/pagination";

export async function getAdmins(page: number, limit: number, search: string, sortBy: string = "createdAt", sortDir: string = "desc"): Promise<PageResponse<User>> {
  const res = await api.get(`/admins?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortDir=${sortDir}`);
  return res.data;
}

export async function createAdmin(data: CreateAdminRequest): Promise<User> {
  const res = await api.post("/admins", data);
  return res.data;
}

export async function updateAdmin(id: string, data: UpdateAdminRequest): Promise<User> {
  const res = await api.put(`/admins/${id}`, data);
  return res.data;
}

export async function deleteAdmin(id: string): Promise<void> {
  const res = await api.delete(`/admins/${id}`);
  return res.data;
}
