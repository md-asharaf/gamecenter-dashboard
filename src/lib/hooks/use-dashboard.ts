import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../services/dashboard";

export function useDashboardStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    enabled,
  });
}
