export interface Question {
  id: string;
  folderId: string;
  createdAt: number;
  updatedAt: number;
  [key: string]: unknown;
}

export interface QuestionPageResponse {
  items: Question[];
  lastEvaluatedKey: string | null;
}
