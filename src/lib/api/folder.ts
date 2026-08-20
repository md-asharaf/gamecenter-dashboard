import { api } from "./axios";
import { Folder, CreateFolderRequest, UpdateFolderRequest, FolderPageResponse } from "../types/folder";

export const getFolders = async (projectId: string, limit: number = 10, lastEvaluatedKey?: string): Promise<FolderPageResponse> => {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (lastEvaluatedKey) {
    params.append('lastEvaluatedKey', lastEvaluatedKey);
  }
  const { data } = await api.get<FolderPageResponse>(`/projects/${projectId}/folders?${params.toString()}`);
  return data;
};

export const createFolder = async (projectId: string, req: CreateFolderRequest): Promise<Folder> => {
  const { data } = await api.post<Folder>(`/projects/${projectId}/folders`, req);
  return data;
};

export const updateFolder = async (projectId: string, folderId: string, req: UpdateFolderRequest): Promise<Folder> => {
  const { data } = await api.put<Folder>(`/projects/${projectId}/folders/${folderId}`, req);
  return data;
};

export const deleteFolder = async (projectId: string, folderId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/folders/${folderId}`);
};

export const emptyFolder = async (projectId: string, folderId: string): Promise<void> => {
  await api.post(`/projects/${projectId}/folders/${folderId}/empty`);
};
