"use client";

import { useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { getApiErrorMessage, ApiError } from "@/lib/api/api-error";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/axios";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  folderId: string;
  onSuccess?: () => void;
}

export function UploadDialog({ open, onOpenChange, projectId, folderId, onSuccess }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const currentFile = file;
    setFile(null);
    onOpenChange(false);

    let toastId: string | number | undefined;

    try {
      const ext = currentFile.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv' && ext !== 'docx') {
        toast.error("Unsupported file type. Please upload a .csv or .docx file.");
        return;
      }

      const res = await api.post(`/projects/${projectId}/folders/${folderId}/uploads/presigned-url?ext=${ext}`);
      const { url, key: fullS3Key } = res.data.data;

      toastId = toast.loading("Uploading file... 0%");

      await axios.put(url, currentFile, {
        headers: {
          'Content-Type': currentFile.type || 'application/octet-stream',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            toast.loading(`Uploading file... ${percentCompleted}%`, {
              id: toastId,
            });
          }
        },
      });

      toast.loading("Processing file on server...", { id: toastId });
      
      const fileName = fullS3Key.split('/').pop() || '';
      
      let isDone = false;
      let attempts = 0;
      let notFoundCount = 0;
      while (!isDone && attempts < 60) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
        try {
          const statusRes = await api.get(`/projects/${projectId}/folders/${folderId}/uploads/${fileName}/status`);
          const job = statusRes.data.data;
          notFoundCount = 0;

          if (job.status === "COMPLETED") {
            toast.success("File upload and processing complete. Questions imported.", { id: toastId });
            isDone = true;
            onSuccess?.();
          } else if (job.status === "FAILED") {
            toast.error("Processing failed on server.", {
              id: toastId,
              description: job.errorMessage || "An unknown error occurred",
            });
            isDone = true;
          }
        } catch (pollError) {
          const axiosErr = pollError as AxiosError;
          if (axiosErr.response?.status === 404) {
            notFoundCount++;
            if (notFoundCount >= 5) {
              toast.error("Upload job not found. The file may not have been received by the server.", { id: toastId });
              isDone = true;
            }
          } else {
            console.error("Polling error", pollError);
          }
        }
      }
      
      if (!isDone) {
        toast.error("Processing timed out.", { id: toastId });
      }
      
    } catch (error) {
      const axiosErr = error as AxiosError<ApiError>;
      toast.error("File upload failed.", {
        id: toastId,
        description: getApiErrorMessage(axiosErr),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Bulk Import</DialogTitle>
          <DialogDescription>
            Upload a .csv or .docx file to bulk import questions into this project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
            <div className="space-y-1 text-center">
              <Label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
              >
                <span>Choose a file</span>
                <Input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".csv,.docx"
                  onChange={handleFileChange}
                />
              </Label>
              <p className="text-sm text-muted-foreground">
                or drag and drop
              </p>
            </div>
            {file && (
              <p className="text-sm font-medium mt-4 text-green-600 dark:text-green-400">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
