export type { ApiResponse } from "@/lib/api/api-error";

export interface Project {
  id: string;
  name: string;
  numberOfQuestionsInQuiz: number;
  quizFolderId?: string;
  websiteUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProjectRequest {
  name: string;
  numberOfQuestionsInQuiz?: number;
  websiteUrl?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  numberOfQuestionsInQuiz?: number;
  quizFolderId?: string;
  websiteUrl?: string;
}
