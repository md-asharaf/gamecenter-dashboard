"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, Upload, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api/axios";
import { Question, QuestionPageResponse } from "@/lib/types/question";
import { Project } from "@/lib/types/project";
import { QuestionDialog } from "./components/question-dialog";
import { UploadDialog } from "./components/upload-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function QuestionsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch project details to get the labels
  const { data: projectData, isLoading: isLoadingProject } = useQuery<{ data: Project }>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data;
    },
  });

  const project = projectData?.data;

  // Fetch questions
  const { data: questionsData, isLoading: isLoadingQuestions } = useQuery<{ data: QuestionPageResponse }>({
    queryKey: ["questions", projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/questions?limit=50`);
      return res.data;
    },
  });

  const questions = questionsData?.data?.items || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${projectId}/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", projectId] });
      toast.success("Question deleted successfully");
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error("Failed to delete question", {
        description: error.response?.data?.message || error.message,
      });
      setDeleteId(null);
    },
  });

  const handleCreate = () => {
    setSelectedQuestion(null);
    setIsQuestionDialogOpen(true);
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setIsQuestionDialogOpen(true);
  };

  if (isLoadingProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <Button variant="link" onClick={() => router.push("/projects")}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground mt-1">
            Manage questions and vocabulary for this project.
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Bulk Import
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-zinc-900 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{project.field1Label}</TableHead>
              {project.field2Label && <TableHead>{project.field2Label}</TableHead>}
              {project.field3Label && <TableHead>{project.field3Label}</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingQuestions ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No questions found. Add one or import a CSV/DOCX file.
                </TableCell>
              </TableRow>
            ) : (
              questions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">
                    {q.dynamicProperties[project.field1Label] || "-"}
                  </TableCell>
                  {project.field2Label && (
                    <TableCell>{q.dynamicProperties[project.field2Label] || "-"}</TableCell>
                  )}
                  {project.field3Label && (
                    <TableCell>{q.dynamicProperties[project.field3Label] || "-"}</TableCell>
                  )}
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(q)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => setDeleteId(q.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionDialog 
        open={isQuestionDialogOpen} 
        onOpenChange={setIsQuestionDialogOpen} 
        question={selectedQuestion} 
        project={project}
      />

      <UploadDialog 
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        projectId={projectId}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question from the project.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                if (deleteId) deleteMutation.mutate(deleteId);
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
