export interface Question {
  id: string;
  createdAt: number;
  updatedAt: number;
  [key: string]: any;
}

export interface QuestionPageResponse {
  items: Question[];
  lastEvaluatedKey: string | null;
}
