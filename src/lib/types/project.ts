export type { ApiResponse } from "@/lib/api/api-error";

export interface Project {
  id: string;
  name: string;
  numberOfQuestionsInQuiz: number;
  mainQuestionLabel: string;
  field1Label: string;
  field2Label: string;
  field3Label: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProjectRequest {
  name: string;
  field1Label: string;
  field2Label: string;
  field3Label: string;
}

export interface UpdateProjectRequest {
  name: string;
  numberOfQuestionsInQuiz: number;
  mainQuestionLabel: string;
  field1Label: string;
  field2Label: string;
  field3Label: string;
}
