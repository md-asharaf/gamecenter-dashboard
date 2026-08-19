"use client";

import { useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

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
}

export function UploadDialog({ open, onOpenChange, projectId }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv' && ext !== 'docx') {
        toast.error("Unsupported file type. Please upload a .csv or .docx file.");
        setIsUploading(false);
        return;
      }

      const res = await api.post(`/projects/${projectId}/uploads/presigned-url?ext=${ext}`);
      const { url } = res.data.data; // UploadUrlResponse

      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      toast.success("File uploaded successfully. It will be processed shortly.");
      onOpenChange(false);
      setFile(null);
    } catch (error: any) {
      toast.error("Failed to upload file", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
