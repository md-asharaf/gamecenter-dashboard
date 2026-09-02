import { api } from "../api/api-client";
import { CreateFolderRequest, UpdateFolderRequest, Folder } from "../types/folder";
import { PageResponse } from "../types/pagination";

export async function getFolders(projectId: string, page: number, limit: number, search: string, sortBy: string = "createdAt", sortDir: string = "desc"): Promise<PageResponse<Folder>> {
  const res = await api.get(`/projects/${projectId}/folders?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortDir=${sortDir}`);
  return res.data.data;
}

export async function createFolder(projectId: string, data: CreateFolderRequest): Promise<Folder> {
  const res = await api.post(`/projects/${projectId}/folders`, data);
  return res.data.data;
}

export async function updateFolder(projectId: string, id: string, data: UpdateFolderRequest): Promise<Folder> {
  const res = await api.put(`/projects/${projectId}/folders/${id}`, data);
  return res.data.data;
}

export async function deleteFolder(projectId: string, id: string): Promise<void> {
  const res = await api.delete(`/projects/${projectId}/folders/${id}`);
  return res.data.data;
}

export async function emptyFolder(projectId: string, id: string): Promise<void> {
  const res = await api.post(`/projects/${projectId}/folders/${id}/empty`);
  return res.data.data;
}
