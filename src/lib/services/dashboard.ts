import { api } from "../api/api-client";

export async function getDashboardStats() {
  const res = await api.get("/dashboard/stats");
  return res.data;
}
