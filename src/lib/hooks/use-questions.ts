import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, deleteQuestionsBatch } from "../services/question";
import { CreateQuestionRequest, UpdateQuestionRequest, Question } from "../types/question";

export function useQuestions(projectId: string, folderId: string, page: number = 0, limit: number = 10, search: string = "", sortBy: string = "createdAt", sortDir: string = "desc") {
  return useQuery({
    queryKey: ["questions", projectId, folderId, page, limit, search, sortBy, sortDir],
    queryFn: () => getQuestions(projectId, folderId, page, limit, search, sortBy, sortDir),
    enabled: !!projectId && !!folderId,
  });
}

export function useCreateQuestion(projectId: string, folderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateQuestionRequest) => createQuestion(projectId, folderId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", projectId, folderId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateQuestion(projectId: string, folderId: string, questionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: UpdateQuestionRequest) => updateQuestion(projectId, folderId, questionId, req),
    onMutate: async (newQuestion) => {
      await queryClient.cancelQueries({ queryKey: ["questions", projectId, folderId] });

      const previousQuestions = queryClient.getQueriesData({ queryKey: ["questions", projectId, folderId] });

      queryClient.setQueriesData({ queryKey: ["questions", projectId, folderId] }, (oldData: { items?: Question[] } | undefined) => {
        if (!oldData) return oldData;
        if (oldData.items) {
          return {
            ...oldData,
            items: oldData.items.map((item: Question) =>
              item.id === questionId ? { ...item, ...newQuestion } : item
            ),
          };
        }
        return oldData;
      });

      return { previousQuestions };
    },
    onError: (_, __, context) => {
      if (context?.previousQuestions) {
        context.previousQuestions.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", projectId, folderId] });
    },
  });
}

export function useDeleteQuestion(projectId: string, folderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => deleteQuestion(projectId, folderId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", projectId, folderId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteQuestionsBatch(projectId: string, folderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionIds: string[]) => deleteQuestionsBatch(projectId, folderId, questionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", projectId, folderId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}
