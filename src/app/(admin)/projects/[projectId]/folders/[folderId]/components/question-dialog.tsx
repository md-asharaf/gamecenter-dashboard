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
import { useCreateQuestion, useUpdateQuestion } from "@/lib/hooks/use-questions";
import { Question } from "@/lib/types/question";

const formSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  hint: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: Question | null;
  projectId: string;
  folderId: string;
}

export function QuestionDialog({ open, onOpenChange, question, projectId, folderId }: QuestionDialogProps) {
  const isEditing = !!question;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      answer: "",
      hint: "",
    },
  });

  useEffect(() => {
    if (question && open) {
      form.reset({
        question: question.question || "",
        answer: question.answer || "",
        hint: question.hint || "",
      });
    } else if (!open) {
      form.reset({ question: "", answer: "", hint: "" });
    }
  }, [question, open, form]);

  const createMutation = useCreateQuestion(projectId, folderId);
  const updateMutation = useUpdateQuestion(projectId, folderId, question?.id || "");

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Question updated successfully.");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("Question update failed.", {
            description: getApiErrorMessage(error as AxiosError<ApiError>),
          });
        },
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Question created successfully.");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("Question creation failed.", {
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
          <DialogTitle>{isEditing ? "Edit Question" : "Add Question"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify the question details below." : "Enter details for the new question."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => onSubmit(v))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input id="question" {...form.register("question")} />
            {form.formState.errors.question && (
              <p className="text-sm text-red-500">{form.formState.errors.question.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Input id="answer" {...form.register("answer")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hint">Hint <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="hint" {...form.register("hint")} />
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
