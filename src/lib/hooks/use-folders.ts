import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFolders, getFolder, createFolder, updateFolder, deleteFolder, emptyFolder } from "../services/folder";
import { CreateFolderRequest, UpdateFolderRequest, Folder } from "../types/folder";

export function useFolders(projectId: string, page: number = 0, limit: number = 10, search: string = "", sortBy: string = "createdAt", sortDir: string = "desc") {
  return useQuery({
    queryKey: ["folders", projectId, page, limit, search, sortBy, sortDir],
    queryFn: () => getFolders(projectId, page, limit, search, sortBy, sortDir),
    enabled: !!projectId,
  });
}

export function useCreateFolder(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateFolderRequest) => createFolder(projectId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateFolder(projectId: string, folderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: UpdateFolderRequest) => updateFolder(projectId, folderId, req),
    onMutate: async (newFolder) => {
      await queryClient.cancelQueries({ queryKey: ["folder", folderId] });
      await queryClient.cancelQueries({ queryKey: ["folders", projectId] });

      const previousFolder = queryClient.getQueryData(["folder", folderId]);
      const previousFolders = queryClient.getQueriesData({ queryKey: ["folders", projectId] });

      if (previousFolder) {
        queryClient.setQueryData(["folder", folderId], (old: Folder | undefined) => {
          if (!old) return old;
          return { ...old, ...newFolder } as Folder;
        });
      }

      queryClient.setQueriesData({ queryKey: ["folders", projectId] }, (oldData: { items?: Folder[] } | undefined) => {
        if (!oldData) return oldData;
        if (oldData.items) {
          return {
            ...oldData,
            items: oldData.items.map((item: Folder) =>
              item.id === folderId ? { ...item, ...newFolder } : item
            ),
          };
        }
        return oldData;
      });

      return { previousFolder, previousFolders };
    },
    onError: (_, __, context) => {
      if (context?.previousFolder) {
        queryClient.setQueryData(["folder", folderId], context.previousFolder);
      }
      if (context?.previousFolders) {
        context.previousFolders.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", projectId] });
      queryClient.invalidateQueries({ queryKey: ["folder", folderId] });
    },
  });
}

export function useDeleteFolder(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) => deleteFolder(projectId, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useEmptyFolder(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) => emptyFolder(projectId, folderId),
    onSuccess: (_, folderId) => {
      queryClient.invalidateQueries({ queryKey: ["folders", projectId] });
      queryClient.invalidateQueries({ queryKey: ["questions", projectId, folderId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useFolder(projectId: string, folderId: string, initialData?: Folder | null) {
  return useQuery({
    queryKey: ["folder", folderId],
    queryFn: () => getFolder(projectId, folderId),
    initialData: initialData ? initialData : undefined,
    staleTime: 0,
  });
}
