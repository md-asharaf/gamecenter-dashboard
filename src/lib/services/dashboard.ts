import { api } from "../api/api-client";

export interface DashboardStats {
  totalProjects: number;
  totalAdmins: number;
  projectStats: { projectId: string; projectName: string; questionCount: number }[];
  projectGrowth: { date: string; total: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await api.get("/dashboard/stats");
  return res.data.data;
}
