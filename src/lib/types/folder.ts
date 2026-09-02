import type { PageResponse } from "./pagination";

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

export type FolderPageResponse = PageResponse<Folder>;
