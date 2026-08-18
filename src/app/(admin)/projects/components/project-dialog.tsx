"use client";

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
import { Project, CreateProjectRequest, UpdateProjectRequest } from "@/lib/types/project";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  field1Label: z.string().min(1, "Field 1 label is required"),
  field2Label: z.string().min(1, "Field 2 label is required"),
  field3Label: z.string().min(1, "Field 3 label is required"),
  numberOfQuestionsInQuiz: z.number().min(1).max(100),
  mainQuestionLabel: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

export function ProjectDialog({ open, onOpenChange, project }: ProjectDialogProps) {
  const isEditing = !!project;
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      field1Label: "Word",
      field2Label: "Context",
      field3Label: "Translation",
      numberOfQuestionsInQuiz: 10,
      mainQuestionLabel: "field1",
    },
  });

  useEffect(() => {
    if (project && open) {
      form.reset({
        name: project.name,
        field1Label: project.field1Label,
        field2Label: project.field2Label,
        field3Label: project.field3Label,
        numberOfQuestionsInQuiz: project.numberOfQuestionsInQuiz || 10,
        mainQuestionLabel: project.mainQuestionLabel || project.field1Label,
      });
    } else if (!open) {
      form.reset({
        name: "",
        field1Label: "Word",
        field2Label: "Context",
        field3Label: "Translation",
        numberOfQuestionsInQuiz: 10,
        mainQuestionLabel: "field1",
      });
    }
  }, [project, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEditing) {
        const payload: UpdateProjectRequest = {
          name: values.name,
          field1Label: values.field1Label,
          field2Label: values.field2Label,
          field3Label: values.field3Label,
          numberOfQuestionsInQuiz: values.numberOfQuestionsInQuiz || 10,
          mainQuestionLabel: values.mainQuestionLabel || "field1",
        };
        const res = await api.put(`/projects/${project.id}`, payload);
        return res.data;
      } else {
        const payload: CreateProjectRequest = {
          name: values.name,
          field1Label: values.field1Label,
          field2Label: values.field2Label,
          field3Label: values.field3Label,
        };
        const res = await api.post("/projects", payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(isEditing ? "Project updated successfully" : "Project created successfully");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(isEditing ? "Failed to update project" : "Failed to create project", {
        description: error.response?.data?.message || error.message,
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field1Label">Field 1 Label</Label>
              <Input id="field1Label" {...form.register("field1Label")} />
              {form.formState.errors.field1Label && (
                <p className="text-sm text-red-500">{form.formState.errors.field1Label.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="field2Label">Field 2 Label</Label>
              <Input id="field2Label" {...form.register("field2Label")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field3Label">Field 3 Label</Label>
              <Input id="field3Label" {...form.register("field3Label")} />
            </div>
            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="numberOfQuestionsInQuiz">Questions per Quiz</Label>
                <Input id="numberOfQuestionsInQuiz" type="number" {...form.register("numberOfQuestionsInQuiz", { valueAsNumber: true })} />
              </div>
            )}
          </div>

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
