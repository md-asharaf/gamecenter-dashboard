export interface Question {
  id: string;
  createdAt: number;
  updatedAt: number;
  dynamicProperties: Record<string, string>;
}

export interface QuestionPageResponse {
  items: Question[];
  lastEvaluatedKey: string | null;
}
