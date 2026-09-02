import { api } from "../api/api-client";
import { CreateQuestionRequest, UpdateQuestionRequest, Question } from "../types/question";
import { PageResponse } from "../types/pagination";

export async function getQuestions(projectId: string, folderId: string, page: number, limit: number, search: string, sortBy: string = "createdAt", sortDir: string = "desc"): Promise<PageResponse<Question>> {
  const res = await api.get(`/projects/${projectId}/folders/${folderId}/questions?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortDir=${sortDir}`);
  return res.data.data;
}

export async function createQuestion(projectId: string, folderId: string, data: CreateQuestionRequest): Promise<Question> {
  const res = await api.post(`/projects/${projectId}/folders/${folderId}/questions`, data);
  return res.data.data;
}

export async function updateQuestion(projectId: string, folderId: string, questionId: string, data: UpdateQuestionRequest): Promise<Question> {
  const res = await api.put(`/projects/${projectId}/folders/${folderId}/questions/${questionId}`, data);
  return res.data.data;
}

export async function deleteQuestion(projectId: string, folderId: string, questionId: string): Promise<void> {
  const res = await api.delete(`/projects/${projectId}/folders/${folderId}/questions/${questionId}`);
  return res.data.data;
}

export async function deleteQuestionsBatch(projectId: string, folderId: string, questionIds: string[]): Promise<void> {
  const res = await api.delete(`/projects/${projectId}/folders/${folderId}/questions`, { data: questionIds });
  return res.data.data;
}
