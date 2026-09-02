import { useQuery, useMutation } from "@tanstack/react-query";
import { getUploadInstructions, getPresignedUrl, getUploadStatus } from "../services/upload";
import axios from "axios";

export function useUploadInstructions(projectId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["uploadInstructions", projectId],
    queryFn: () => getUploadInstructions(projectId),
    enabled: enabled && !!projectId,
  });
}

export function usePresignedUrl() {
  return useMutation({
    mutationFn: ({ projectId, folderId, ext }: { projectId: string; folderId: string; ext: string }) => 
      getPresignedUrl(projectId, folderId, ext),
  });
}

export function useUploadFileToS3() {
  return useMutation({
    mutationFn: async ({ url, file }: { url: string; file: File }) => {
      await axios.put(url, file, {
        headers: { "Content-Type": file.type },
      });
    },
  });
}

export function useUploadStatus(projectId: string, folderId: string, fileName: string | null, isPolling: boolean) {
  return useQuery({
    queryKey: ["uploadStatus", projectId, folderId, fileName],
    queryFn: () => getUploadStatus(projectId, folderId, fileName!),
    enabled: !!fileName && isPolling,
    refetchInterval: isPolling ? 2000 : false,
  });
}
