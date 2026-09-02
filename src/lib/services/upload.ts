import { api } from "../api/api-client";

export type UploadInstructions = string[];

export interface PresignedUrlResponse {
  url: string;
  key: string;
}

export interface UploadStatusResponse {
  status: string;
  message?: string;
}

export async function getUploadInstructions(projectId: string): Promise<UploadInstructions> {
  const res = await api.get(`/projects/${projectId}/upload-instructions`);
  return res.data.data;
}

export async function getPresignedUrl(projectId: string, folderId: string, ext: string): Promise<PresignedUrlResponse> {
  const res = await api.post(`/projects/${projectId}/folders/${folderId}/uploads/presigned-url?ext=${ext}`);
  return res.data.data;
}

export async function getUploadStatus(projectId: string, folderId: string, fileName: string): Promise<UploadStatusResponse> {
  const res = await api.get(`/projects/${projectId}/folders/${folderId}/uploads/${fileName}/status`);
  return res.data.data;
}

export async function getUploadTemplateUrl(projectId: string): Promise<Blob> {
  const res = await api.get(`/projects/${projectId}/upload-template`, {
    responseType: 'blob',
  });
  return res.data;
}
