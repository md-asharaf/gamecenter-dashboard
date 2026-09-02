import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjects, getProject, createProject, updateProject, deleteProject } from "../services/project";
import { CreateProjectRequest, Project, UpdateProjectRequest } from "../types/project";

export function useProjects(page: number = 0, limit: number = 10, search: string = "", sortBy: string = "createdAt", sortDir: string = "desc") {
  return useQuery({
    queryKey: ["projects", page, limit, search, sortBy, sortDir],
    queryFn: () => getProjects(page, limit, search, sortBy, sortDir),
  });
}

import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfiniteProjects(limit: number = 10, search: string = "", sortBy: string = "createdAt", sortDir: string = "desc") {
  return useInfiniteQuery({
    queryKey: ["projects", "infinite", limit, search, sortBy, sortDir],
    queryFn: ({ pageParam = 0 }) => getProjects(pageParam, limit, search, sortBy, sortDir),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage && !lastPage.isLast) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
  });
}

export function useProject(id: string, initialData?: Project) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
    initialData: initialData ? initialData : undefined,
    staleTime: 0,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateProjectRequest) => createProject(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: UpdateProjectRequest) => updateProject(id, req),
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ["project", id] });
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      const previousProject = queryClient.getQueryData(["project", id]);
      const previousProjects = queryClient.getQueriesData({ queryKey: ["projects"] });

      if (previousProject) {
        queryClient.setQueryData(["project", id], (old: Project | undefined) => {
          if (!old) return old;
          return { ...old, ...newProject } as Project;
        });
      }

      queryClient.setQueriesData({ queryKey: ["projects"] }, (oldData: { items?: Project[], pages?: { items: Project[] }[] } | undefined) => {
        if (!oldData) return oldData;
        if (oldData.items) {
          return {
            ...oldData,
            items: oldData.items.map((item: Project) =>
              item.id === id ? { ...item, ...newProject } : item
            ),
          };
        }
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: { items: Project[] }) => ({
              ...page,
              items: (page.items || []).map((item: Project) =>
                item.id === id ? { ...item, ...newProject } : item
              ),
            })),
          };
        }
        return oldData;
      });

      return { previousProject, previousProjects };
    },
    onError: (_, __, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(["project", id], context.previousProject);
      }
      if (context?.previousProjects) {
        context.previousProjects.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}
