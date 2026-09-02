import { api } from "../api/api-client";
import { CreateQuestionRequest, UpdateQuestionRequest } from "../types/question";

export async function getQuestions(projectId: string, folderId: string, page: number, limit: number, search: string, sortBy: string = "createdAt", sortDir: string = "desc") {
  const res = await api.get(`/projects/${projectId}/folders/${folderId}/questions?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortDir=${sortDir}`);
  return res.data;
}

export async function createQuestion(projectId: string, folderId: string, data: CreateQuestionRequest) {
  const res = await api.post(`/projects/${projectId}/folders/${folderId}/questions`, data);
  return res.data;
}

export async function updateQuestion(projectId: string, folderId: string, questionId: string, data: UpdateQuestionRequest) {
  const res = await api.put(`/projects/${projectId}/folders/${folderId}/questions/${questionId}`, data);
  return res.data;
}

export async function deleteQuestion(projectId: string, folderId: string, questionId: string) {
  const res = await api.delete(`/projects/${projectId}/folders/${folderId}/questions/${questionId}`);
  return res.data;
}

export async function deleteQuestionsBatch(projectId: string, folderId: string, questionIds: string[]) {
  const res = await api.delete(`/projects/${projectId}/folders/${folderId}/questions`, { data: questionIds });
  return res.data;
}
