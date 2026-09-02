"use client";
import { AxiosError } from "axios";
import { getApiErrorMessage, ApiError } from "@/lib/api/api-error";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, X } from "lucide-react";
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
import { Question, CreateQuestionRequest } from "@/lib/types/question";

const formSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  hint: z.string().optional(),
  options: z.array(z.object({ value: z.string().min(1, "Option cannot be empty") })).optional(),
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
      options: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  useEffect(() => {
    if (question && open) {
      form.reset({
        question: question.question || "",
        answer: question.answer || "",
        hint: question.hint || "",
        options: question.options ? question.options.map((opt) => ({ value: opt })) : [],
      });
    } else if (!open) {
      form.reset({ question: "", answer: "", hint: "", options: [] });
    }
  }, [question, open, form]);

  const createMutation = useCreateQuestion(projectId, folderId);
  const updateMutation = useUpdateQuestion(projectId, folderId, question?.id || "");

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    const payload = {
      question: values.question,
      answer: values.answer,
      hint: values.hint,
      options: values.options ? values.options.map((opt) => opt.value) : [],
    };

    if (isEditing) {
      updateMutation.mutate(payload, {
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
      createMutation.mutate(payload, {
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
            {form.formState.errors.answer && (
              <p className="text-sm text-red-500">{form.formState.errors.answer.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Options <span className="text-muted-foreground text-xs">(for multiple choice)</span></Label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      {...form.register(`options.${index}.value` as const)}
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="h-9 w-9 text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: "" })}
                className="mt-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Option
              </Button>
            </div>
            {form.formState.errors.options && (
              <p className="text-sm text-red-500">
                {form.formState.errors.options.message || form.formState.errors.options.root?.message}
              </p>
            )}
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
