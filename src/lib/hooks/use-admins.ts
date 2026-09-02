import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from "../services/admin";
import { CreateAdminRequest, UpdateAdminRequest, User } from "../types/user";

export function useAdmins(page: number = 0, limit: number = 10, search: string = "", sortBy: string = "createdAt", sortDir: string = "desc") {
  return useQuery({
    queryKey: ["admins", page, limit, search, sortBy, sortDir],
    queryFn: () => getAdmins(page, limit, search, sortBy, sortDir),
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateAdminRequest) => createAdmin(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateAdmin(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: UpdateAdminRequest) => updateAdmin(id, req),
    onMutate: async (newAdmin) => {
      await queryClient.cancelQueries({ queryKey: ["admins"] });
      const previousAdmins = queryClient.getQueriesData({ queryKey: ["admins"] });

      queryClient.setQueriesData({ queryKey: ["admins"] }, (oldData: { items?: User[] } | undefined) => {
        if (!oldData) return oldData;
        if (oldData.items) {
          return {
            ...oldData,
            items: oldData.items.map((item: User) =>
              item.id === id ? { ...item, ...newAdmin } : item
            ),
          };
        }
        return oldData;
      });

      return { previousAdmins };
    },
    onError: (_, __, context) => {
      if (context?.previousAdmins) {
        context.previousAdmins.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}
