"use client";

import { AxiosError } from "axios";
import { getApiErrorMessage, ApiError } from "@/lib/api/api-error";

import { useState } from "react";
import { Plus, Globe } from "lucide-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import { Folder } from "@/lib/types/folder";
import { useFolders, useDeleteFolder, useEmptyFolder } from "@/lib/hooks/use-folders";
import { useProject, useUpdateProject } from "@/lib/hooks/use-projects";
import { ServerDataTable } from "@/components/ui/server-data-table";
import { FolderDialog } from "./components/folder-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { getColumns } from "./columns";

export function FoldersClient({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId);

  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [emptyId, setEmptyId] = useState<string | null>(null);

  const {
    currentPage,
    limit,
    search,
    sorting,
    columnVisibility,
    handleSearch,
    handleNextPage,
    handlePrevPage,
    handlePageChange,
    setLimit,
    setSorting,
    setColumnVisibility,
  } = useTablePagination();

  const sortBy = sorting[0]?.id || "createdAt";
  const sortDir = sorting[0]?.desc ? "desc" : "asc";

  const { data: pageData, isFetching, refetch } = useFolders(projectId, currentPage, limit, search, sortBy, sortDir);

  const folders = [...(pageData?.items || [])].sort((a, b) => {
    if (a.id === project?.quizFolderId) return -1;
    if (b.id === project?.quizFolderId) return 1;
    return 0;
  });

  const deleteMutation = useDeleteFolder(projectId);
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Folder deleted successfully.");
        setDeleteId(null);
      },
      onError: (error) => {
        toast.error("Failed to delete folder.", {
          description: getApiErrorMessage(error as AxiosError<ApiError>),
        });
        setDeleteId(null);
      },
    });
  };

  const emptyMutation = useEmptyFolder(projectId);
  const handleEmpty = (id: string) => {
    emptyMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Folder emptied successfully.");
        setEmptyId(null);
      },
      onError: (error) => {
        toast.error("Failed to empty folder.", {
          description: getApiErrorMessage(error as AxiosError<ApiError>),
        });
        setEmptyId(null);
      },
    });
  };

  const updateProjectMutation = useUpdateProject(projectId);
  const handleMakeActive = (folderId: string) => {
    if (!project) return;
    updateProjectMutation.mutate({
      name: project.name,
      numberOfQuestionsInQuiz: project.numberOfQuestionsInQuiz || 10,
      websiteUrl: project.websiteUrl,
      quizFolderId: folderId,
    }, {
      onSuccess: () => {
        toast.success("Active quiz folder updated.");
      },
      onError: (error) => {
        toast.error("Failed to update active folder.", {
          description: getApiErrorMessage(error as AxiosError<ApiError>),
        });
      },
    });
  };

  const handleEdit = (folder: Folder) => {
    setSelectedFolder(folder);
    setIsFolderDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedFolder(null);
    setIsFolderDialogOpen(true);
  };

  const columns = getColumns(
    projectId,
    project,
    handleMakeActive,
    handleEdit,
    setEmptyId,
    setDeleteId,
    updateProjectMutation.isPending
  );

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project?.name || "Project"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">{project?.name || "Project"} Folders</h1>
          <p className="text-muted-foreground mt-1">
            Organize questions into folders. Select an active quiz folder in project settings.
          </p>
          {project?.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
              title="Open game website to verify before uploading questions"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="truncate max-w-[300px]">View Game: {project.websiteUrl}</span>
            </a>
          )}
        </div>
        <div className="flex flex-wrap w-full sm:w-auto gap-2 mt-4 sm:mt-0">
          <Button className="flex-1 sm:flex-none" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Folder
          </Button>
        </div>
      </div>

      <ServerDataTable
        columns={columns}
        data={folders}
        isLoading={isFetching}
        onSearch={handleSearch}
        searchPlaceholder="Search folders..."
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        onPageChange={handlePageChange}
        hasNextPage={!pageData?.last}
        hasPrevPage={currentPage > 0}
        currentPage={currentPage}
        totalPages={pageData?.totalPages}
        totalElements={pageData?.totalElements}
        limit={limit}
        onLimitChange={setLimit}
        sorting={sorting}
        onSortingChange={setSorting}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        onRefresh={refetch}
      />

      <FolderDialog
        open={isFolderDialogOpen}
        onOpenChange={setIsFolderDialogOpen}
        folder={selectedFolder}
        projectId={projectId}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId);
        }}
        isPending={deleteMutation.isPending}
        description="This will permanently delete the folder and all its questions."
      />

      <DeleteConfirmDialog
        open={!!emptyId}
        onOpenChange={(open) => !open && setEmptyId(null)}
        onConfirm={() => {
          if (emptyId) handleEmpty(emptyId);
        }}
        isPending={emptyMutation.isPending}
        title="Empty Folder?"
        description="This will permanently delete all questions in this folder. The folder itself will remain."
      />
    </div >
  );
}
