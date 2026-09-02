import type { PageResponse } from "./pagination";

export interface Question {
  id: string;
  folderId: string;
  question: string;
  answer: string;
  hint?: string;
  options?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateQuestionRequest {
  question: string;
  answer: string;
  hint?: string;
  options?: string[];
}

export interface UpdateQuestionRequest {
  question?: string;
  answer?: string;
  hint?: string;
  options?: string[];
}

export type QuestionPageResponse = PageResponse<Question>;
