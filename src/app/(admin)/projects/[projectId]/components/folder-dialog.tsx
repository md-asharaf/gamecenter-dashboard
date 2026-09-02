"use client";

import { AxiosError } from "axios";
import { getApiErrorMessage, ApiError } from "@/lib/api/api-error";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { Folder } from "@/lib/types/folder";
import { useCreateFolder, useUpdateFolder } from "@/lib/hooks/use-folders";

interface FolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder?: Folder | null;
  projectId: string;
}

export function FolderDialog({ open, onOpenChange, folder, projectId }: FolderDialogProps) {
  const isEditing = !!folder;

  const formSchema = z.object({
    name: z.string().min(1, "Folder name is required").max(100, "Name must be less than 100 characters"),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (folder && open) {
      form.reset({
        name: folder.name,
      });
    } else if (!open) {
      form.reset({
        name: "",
      });
    }
  }, [folder, open, form]);

  const createMutation = useCreateFolder(projectId);
  const updateMutation = useUpdateFolder(projectId, folder?.id || "");

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Folder updated successfully.");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("Folder update failed.", {
            description: getApiErrorMessage(error as AxiosError<ApiError>),
          });
        },
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Folder created successfully.");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("Folder creation failed.", {
            description: getApiErrorMessage(error as AxiosError<ApiError>),
          });
        },
      });
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Folder" : "Create Folder"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify the folder details below." : "Enter details for the new folder."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Science Quiz" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
