"use client";
"use no memo";

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

import { useCreateProject, useUpdateProject } from "@/lib/hooks/use-projects";
import { Project } from "@/lib/types/project";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  numberOfQuestionsInQuiz: z.number().min(1, "Must be at least 1").max(100, "Cannot exceed 100"),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

export function ProjectDialog({ open, onOpenChange, project }: ProjectDialogProps) {
  const isEditing = !!project;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      numberOfQuestionsInQuiz: 10,
      websiteUrl: "",
    },
  });

  useEffect(() => {
    if (project && open) {
      form.reset({
        name: project.name,
        numberOfQuestionsInQuiz: project.numberOfQuestionsInQuiz || 10,
        websiteUrl: project.websiteUrl || "",
      });
    } else if (!open) {
      form.reset({
        name: "",
        numberOfQuestionsInQuiz: 10,
        websiteUrl: "",
      });
    }
  }, [project, open, form]);

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject(project?.id || "");

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      numberOfQuestionsInQuiz: values.numberOfQuestionsInQuiz,
      websiteUrl: values.websiteUrl || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Project updated successfully.");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("Project update failed.", {
            description: getApiErrorMessage(error as AxiosError<ApiError>),
          });
        },
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Project created successfully.");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("Project creation failed.", {
            description: getApiErrorMessage(error as AxiosError<ApiError>),
          });
        },
      });
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Project" : "Create Project"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify project details below." : "Enter details for the new project."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" {...form.register("name")} placeholder="e.g. Spanish Vocabulary" />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfQuestionsInQuiz">Questions per Quiz</Label>
            <Input
              id="numberOfQuestionsInQuiz"
              type="number"
              {...form.register("numberOfQuestionsInQuiz", { valueAsNumber: true })}
            />
            {form.formState.errors.numberOfQuestionsInQuiz && (
              <p className="text-sm text-red-500">{form.formState.errors.numberOfQuestionsInQuiz.message}</p>
            )}
            <p className="text-xs text-muted-foreground">How many questions to include in a randomly generated quiz.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website / Game URL <span className="text-muted-foreground text-xs">(Optional)</span></Label>
            <Input id="websiteUrl" type="url" {...form.register("websiteUrl")} placeholder="https://example.com" />
            {form.formState.errors.websiteUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.websiteUrl.message}</p>
            )}
            <p className="text-xs text-muted-foreground">URL where quizzes are played. Helps admins verify the game before uploading questions.</p>
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
