import { api } from "../api/api-client";
import { CreateProjectRequest, UpdateProjectRequest, Project } from "../types/project";
import { PageResponse } from "../types/pagination";

export async function getProjects(page: number, limit: number, search: string, sortBy: string = "createdAt", sortDir: string = "desc"): Promise<PageResponse<Project>> {
  const res = await api.get(`/projects?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortDir=${sortDir}`);
  return res.data.data;
}

export async function getProject(id: string): Promise<Project> {
  const res = await api.get(`/projects/${id}`);
  return res.data.data;
}

export async function createProject(data: CreateProjectRequest): Promise<Project> {
  const res = await api.post("/projects", data);
  return res.data.data;
}

export async function updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
  const res = await api.put(`/projects/${id}`, data);
  return res.data.data;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await api.delete(`/projects/${id}`);
  return res.data.data;
}
