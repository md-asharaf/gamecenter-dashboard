export interface User {
  id: string;
  email: string;
  role: string;
  projectIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface RegisterAdminRequest {
  email: string;
  password?: string;
  projectIds: string[];
}

export interface UpdateAdminRequest {
  email: string;
  password?: string;
  projectIds: string[];
}
