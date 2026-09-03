import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, login, logout, updatePassword } from "../services/auth";

export function useGetMe() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: getMe,
    staleTime: Infinity,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logout,
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: updatePassword,
  });
}
