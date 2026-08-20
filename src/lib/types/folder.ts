export interface Folder {
  id: string;
  projectId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFolderRequest {
  name: string;
}

export interface UpdateFolderRequest {
  name: string;
}

export interface FolderPageResponse {
  items: Folder[];
  lastEvaluatedKey?: string;
}
