import { api } from "../api/api-client";
import { CreateProjectRequest, UpdateProjectRequest } from "../types/project";

export async function getProjects(page: number, limit: number, search: string, sortBy: string = "createdAt", sortDir: string = "desc") {
  const res = await api.get(`/projects?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortDir=${sortDir}`);
  return res.data;
}

export async function getProject(id: string) {
  const res = await api.get(`/projects/${id}`);
  return res.data;
}

export async function createProject(data: CreateProjectRequest) {
  const res = await api.post("/projects", data);
  return res.data;
}

export async function updateProject(id: string, data: UpdateProjectRequest) {
  const res = await api.put(`/projects/${id}`, data);
  return res.data;
}

export async function deleteProject(id: string) {
  const res = await api.delete(`/projects/${id}`);
  return res.data;
}
