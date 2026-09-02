import { api } from "../api/api-client";

export async function getUploadInstructions(projectId: string) {
  const res = await api.get(`/projects/${projectId}/upload-instructions`);
  return res.data;
}

export async function getPresignedUrl(projectId: string, folderId: string, ext: string) {
  const res = await api.post(`/projects/${projectId}/folders/${folderId}/uploads/presigned-url?ext=${ext}`);
  return res.data;
}

export async function getUploadStatus(projectId: string, folderId: string, fileName: string) {
  const res = await api.get(`/projects/${projectId}/folders/${folderId}/uploads/${fileName}/status`);
  return res.data;
}

export async function getUploadTemplateUrl(projectId: string) {
  const res = await api.get(`/projects/${projectId}/upload-template`, {
    responseType: 'blob',
  });
  return res.data;
}
