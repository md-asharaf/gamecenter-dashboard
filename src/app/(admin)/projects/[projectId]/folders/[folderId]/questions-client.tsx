"use client";

import { useState } from "react";
import { useQuestions, useDeleteQuestion, useDeleteQuestionsBatch } from "@/lib/hooks/use-questions";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Question } from "@/lib/types/question";
import { QuestionDialog } from "./components/question-dialog";
import { UploadDialog } from "./components/upload-dialog";
import { ServerDataTable } from "@/components/ui/server-data-table";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { getColumns } from "./columns";

import { AxiosError } from "axios";
import { getApiErrorMessage, ApiError } from "@/lib/api/api-error";
import { useQueryClient } from "@tanstack/react-query";
import { useProject } from "@/lib/hooks/use-projects";
import { useFolder } from "@/lib/hooks/use-folders";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

interface QuestionsClientProps {
  projectId: string;
  folderId: string;
}

export function QuestionsClient({ projectId, folderId }: QuestionsClientProps) {
  const queryClient = useQueryClient();
  const { data: project } = useProject(projectId);
  const { data: folder } = useFolder(projectId, folderId);

  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const {
    currentPage,
    limit,
    search,
    sorting,
    columnVisibility,
    rowSelection,
    handleSearch,
    handleNextPage,
    handlePrevPage,
    handlePageChange,
    setLimit,
    setSorting,
    setColumnVisibility,
    setRowSelection,
  } = useTablePagination();

  const sortBy = sorting[0]?.id || "createdAt";
  const sortDir = sorting[0]?.desc ? "desc" : "asc";

  const { data: pageData, isFetching, refetch } = useQuestions(projectId, folderId, currentPage, limit, search, sortBy, sortDir);

  const deleteMutation = useDeleteQuestion(projectId, folderId);
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Question deleted successfully.");
        setDeleteId(null);
      },
      onError: (error) => {
        toast.error("Question deletion failed.", {
          description: getApiErrorMessage(error as AxiosError<ApiError>),
        });
        setDeleteId(null);
      },
    });
  };

  const deleteMultipleMutation = useDeleteQuestionsBatch(projectId, folderId);
  const handleDeleteMultiple = (ids: string[]) => {
    deleteMultipleMutation.mutate(ids, {
      onSuccess: () => {
        toast.success("Selected questions deleted successfully.");
        setRowSelection({});
      },
      onError: (error) => {
        toast.error("Failed to delete selected questions.", {
          description: getApiErrorMessage(error as AxiosError<ApiError>),
        });
      },
    });
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setIsQuestionDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedQuestion(null);
    setIsQuestionDialogOpen(true);
  };

  const columns = getColumns(handleEdit, setDeleteId);

  const questions = pageData?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/projects" />}>Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={`/projects/${projectId}`} />}>
              {project?.name || "Project"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{folder?.name || "Folder"} Questions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{folder?.name ? `${folder.name} Questions` : "Questions"}</h1>
          <p className="text-muted-foreground mt-1">
            Manage questions and entries for this project.
          </p>
        </div>
        <div className="flex flex-wrap w-full sm:w-auto gap-2 mt-4 sm:mt-0">
          {Object.keys(rowSelection).length > 0 && (
            <Button variant="destructive" className="flex-1 sm:flex-none" onClick={() => {
              const ids = Object.keys(rowSelection).map(idx => questions[parseInt(idx)]?.id).filter(Boolean) as string[];
              if (ids.length > 0) handleDeleteMultiple(ids);
            }}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete ({Object.keys(rowSelection).length})
            </Button>
          )}
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload CSV/DOCX
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>

      <ServerDataTable
        columns={columns}
        data={questions}
        searchPlaceholder="Search by question..."
        onSearch={handleSearch}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        onPageChange={handlePageChange}
        hasNextPage={!pageData?.last}
        hasPrevPage={currentPage > 0}
        isLoading={isFetching}
        currentPage={currentPage}
        totalPages={pageData?.totalPages}
        totalElements={pageData?.totalElements}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        limit={limit}
        onLimitChange={setLimit}
        sorting={sorting}
        onSortingChange={setSorting}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        onRefresh={refetch}
      />

      <QuestionDialog
        open={isQuestionDialogOpen}
        onOpenChange={setIsQuestionDialogOpen}
        question={selectedQuestion}
        folderId={folderId}
        projectId={projectId}
      />

      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        projectId={projectId}
        folderId={folderId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["questions", projectId, folderId] });
          queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
        }}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId);
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
