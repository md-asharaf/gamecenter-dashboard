"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings2, Trash2, Upload, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/axios";
import { Project } from "@/lib/types/project";
import { Question } from "@/lib/types/question";
import { QuestionDialog } from "./components/question-dialog";
import { UploadDialog } from "./components/upload-dialog";
import { ServerDataTable } from "@/components/ui/server-data-table";
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

interface QuestionPageResponse {
  items: Question[];
  lastEvaluatedKey: string | null;
}

export function QuestionsClient({ projectId, project }: { projectId: string; project: Project | null }) {
  const queryClient = useQueryClient();
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isFetching } = useQuery<{ data: QuestionPageResponse }>({
    queryKey: ["questions", projectId, currentCursor, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", "10");
      if (currentCursor) params.append("lastEvaluatedKey", currentCursor);
      if (search) params.append("search", search);

      const res = await api.get(`/projects/${projectId}/questions?${params.toString()}`);
      return res.data;
    },
  });

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

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setIsQuestionDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedQuestion(null);
    setIsQuestionDialogOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentCursor(null);
    setHistory([]);
  };

  const handleNextPage = () => {
    if (data?.data.lastEvaluatedKey) {
      setHistory((prev) => [...prev, currentCursor || ""]);
      setCurrentCursor(data.data.lastEvaluatedKey);
    }
  };

  const handlePrevPage = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevCursor = newHistory.pop();
      setHistory(newHistory);
      setCurrentCursor(prevCursor || null);
    }
  };

  const columns: ColumnDef<Question>[] = [
    {
      id: "field1",
      header: project?.field1Label || "Field 1",
      cell: ({ row }) => project ? (row.original.dynamicProperties[project.field1Label] || "-") : "-",
    },
    {
      id: "field2",
      header: project?.field2Label || "Field 2",
      cell: ({ row }) => project?.field2Label ? (row.original.dynamicProperties[project.field2Label] || "-") : "-",
    },
    {
      id: "field3",
      header: project?.field3Label || "Field 3",
      cell: ({ row }) => project?.field3Label ? (row.original.dynamicProperties[project.field3Label] || "-") : "-",
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const question = row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(question)}>
              <Settings2 className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteId(question.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const questions = data?.data.items || [];
  const hasNextPage = !!data?.data.lastEvaluatedKey;
  const hasPrevPage = history.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project?.name || "Project"} Questions</h1>
          <p className="text-muted-foreground mt-1">
            Manage questions and entries for this project.
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload CSV
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>

      <ServerDataTable 
        columns={columns} 
        data={questions} 
        searchPlaceholder={`Search by ${project?.field1Label || 'Field 1'}...`} 
        onSearch={handleSearch}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        isLoading={isFetching}
      />

      {project && (
        <QuestionDialog
          open={isQuestionDialogOpen}
          onOpenChange={setIsQuestionDialogOpen}
          question={selectedQuestion}
          project={project}
        />
      )}

      {project && (
        <UploadDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          projectId={projectId}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question. This action cannot be undone.
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
