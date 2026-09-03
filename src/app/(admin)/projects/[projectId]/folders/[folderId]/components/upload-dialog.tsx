"use client";

import { useState } from "react";
import { Loader2, UploadCloud, FileDown, Info } from "lucide-react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { ApiError, getErrorMessage } from "@/lib/api/api-error";

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
import { getUploadTemplateUrl, getPresignedUrl, getUploadStatus } from "@/lib/services/upload";
import { useUploadInstructions } from "@/lib/hooks/use-upload";

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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { data: instructionsData, isLoading: isLoadingInstructions } = useUploadInstructions(projectId, open);

  const instructions = (instructionsData as string[]) || [];

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'csv' || ext === 'docx') {
        setFile(droppedFile);
      } else {
        toast.error("Unsupported file type. Please upload a .csv or .docx file.");
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blobData = await getUploadTemplateUrl(projectId);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'upload_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Failed to download template.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const currentFile = file;
    setIsUploading(true);
    setUploadProgress(0);

    let toastId: string | number | undefined;

    try {
      const ext = currentFile.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv' && ext !== 'docx') {
        toast.error("Unsupported file type. Please upload a .csv or .docx file.");
        setIsUploading(false);
        setUploadProgress(null);
        return;
      }

      const res = await getPresignedUrl(projectId, folderId, ext);
      const { url, key: fullS3Key } = res;

      await axios.put(url, currentFile, {
        headers: {
          'Content-Type': currentFile.type || 'application/octet-stream',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      setFile(null);
      setUploadProgress(null);
      setIsUploading(false);
      onOpenChange(false);

      toastId = toast.loading("Processing file...");

      const fileName = fullS3Key.split('/').pop() || '';

      let isDone = false;
      let attempts = 0;
      let notFoundCount = 0;
      while (!isDone && attempts < 90) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;

        if (attempts === 10) {
          toast.loading("Parsing questions and saving to database...", { id: toastId });
        } else if (attempts === 30) {
          toast.loading("Still processing questions batch...", { id: toastId });
        }

        try {
          const statusRes = await getUploadStatus(projectId, folderId, fileName);
          const job = statusRes;
          notFoundCount = 0;
          if (job.status === "COMPLETED") {
            toast.success(job.message || "File upload and processing complete. Questions imported.", { id: toastId });
            isDone = true;
            onSuccess?.();
          } else if (job.status === "FAILED") {
            toast.error("Processing failed.", {
              id: toastId,
              description: job.message || "An unknown error occurred",
            });
            isDone = true;
          }
        } catch (pollError) {
          const axiosErr = pollError as AxiosError;
          if (axiosErr.response?.status === 404) {
            notFoundCount++;
            if (notFoundCount >= 8) {
              toast.error("Upload job not found. The file may not have been received by the server.", { id: toastId });
              isDone = true;
            }
          } else {
            console.error("Polling error", pollError);
          }
        }
      }

      if (!isDone) {
        toast.info("Import is still processing in the background. Your questions will appear once processing completes.", { id: toastId });
        onSuccess?.();
      }

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(null);
      const axiosErr = error as AxiosError<ApiError>;
      toast.error("File upload failed.", {
        id: toastId,
        description: getErrorMessage(axiosErr),
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
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400">
                <Info className="h-5 w-5" />
                <h4 className="font-semibold text-sm">Upload Guidelines</h4>
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs bg-white dark:bg-zinc-950" onClick={handleDownloadTemplate}>
                <FileDown className="mr-2 h-3.5 w-3.5" />
                Download Template
              </Button>
            </div>
            {isLoadingInstructions ? (
              <div className="flex items-center space-x-2 text-sm text-blue-600/70 dark:text-blue-400/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading guidelines...</span>
              </div>
            ) : (
              <ul className="space-y-1.5 text-xs text-blue-800/80 dark:text-blue-300/80">
                {instructions.map((inst, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2 mt-0.5">•</span>
                    <span>{inst.replace(/^\d+\.\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors ${isDragging
              ? "border-primary bg-primary/10"
              : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
          >
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
              {isUploading && uploadProgress !== null ? `Uploading... ${uploadProgress}%` : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
