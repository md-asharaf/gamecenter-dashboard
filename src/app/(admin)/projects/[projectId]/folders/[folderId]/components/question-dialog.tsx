"use client";
import { AxiosError } from "axios";
import { getApiErrorMessage, ApiError } from "@/lib/api/api-error";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { api } from "@/lib/api/axios";
import { Question } from "@/lib/types/question";
import { Project } from "@/lib/types/project";

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: Question | null;
  project: Project;
  folderId: string;
}

export function QuestionDialog({ open, onOpenChange, question, project, folderId }: QuestionDialogProps) {
  const isEditing = !!question;
  const queryClient = useQueryClient();

  const formSchema = z.object({
    field1: z.string().min(1, `${project.field1Label} is required`),
    field2: project.field2Label ? z.string().min(1, `${project.field2Label} is required`) : z.string().optional(),
    field3: project.field3Label ? z.string().min(1, `${project.field3Label} is required`) : z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      field1: "",
      field2: "",
      field3: "",
    },
  });

  useEffect(() => {
    if (question && open) {
      form.reset({
        field1: question[project.field1Label] || "",
        field2: project.field2Label ? question[project.field2Label] || "" : "",
        field3: project.field3Label ? question[project.field3Label] || "" : "",
      });
    } else if (!open) {
      form.reset({
        field1: "",
        field2: "",
        field3: "",
      });
    }
  }, [question, open, form, project]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const dynamicFields: Record<string, string> = {
        [project.field1Label]: values.field1,
      };
      if (project.field2Label && values.field2) {
        dynamicFields[project.field2Label] = values.field2;
      }
      if (project.field3Label && values.field3) {
        dynamicFields[project.field3Label] = values.field3;
      }

      if (isEditing) {
        const res = await api.put(`/projects/${project.id}/folders/${folderId}/questions/${question.id}`, {
          dynamicFields,
        });
        return res.data;
      } else {
        const res = await api.post(`/projects/${project.id}/folders/${folderId}/questions`, {
          dynamicFields,
        });
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", project.id, folderId] });
      toast.success(isEditing ? "Question updated successfully." : "Question created successfully.");
      onOpenChange(false);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(isEditing ? "Question update failed." : "Question creation failed.", {
        description: getApiErrorMessage(error),
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Question" : "Add Question"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify the question details below." : "Enter details for the new question."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="field1">{project.field1Label}</Label>
            <Input id="field1" {...form.register("field1")} />
            {form.formState.errors.field1 && (
              <p className="text-sm text-red-500">{form.formState.errors.field1.message}</p>
            )}
          </div>
          
          {project.field2Label && (
            <div className="space-y-2">
              <Label htmlFor="field2">{project.field2Label}</Label>
              <Input id="field2" {...form.register("field2")} />
              {form.formState.errors.field2 && (
                <p className="text-sm text-red-500">{form.formState.errors.field2.message}</p>
              )}
            </div>
          )}

          {project.field3Label && (
            <div className="space-y-2">
              <Label htmlFor="field3">{project.field3Label}</Label>
              <Input id="field3" {...form.register("field3")} />
              {form.formState.errors.field3 && (
                <p className="text-sm text-red-500">{form.formState.errors.field3.message}</p>
              )}
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
