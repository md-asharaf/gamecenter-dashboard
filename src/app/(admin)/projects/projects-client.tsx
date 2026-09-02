"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { getApiErrorMessage, ApiError } from "@/lib/api/api-error";

import { Button } from "@/components/ui/button";
import { Project } from "@/lib/types/project";
import { ProjectDialog } from "./components/project-dialog";
import { ServerDataTable } from "@/components/ui/server-data-table";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { getColumns } from "./columns";

import { useProjects, useDeleteProject } from "@/lib/hooks/use-projects";

export function ProjectsClient() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const { data, isFetching, refetch } = useProjects(currentPage, limit, search, sortBy, sortDir);

  const deleteMutation = useDeleteProject();
  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          toast.success("Project deleted successfully.");
          setDeleteId(null);
        },
        onError: (error) => {
          toast.error("Failed to delete project.", {
            description: getApiErrorMessage(error as AxiosError<ApiError>),
          });
          setDeleteId(null);
        },
      });
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedProject(null);
    setIsDialogOpen(true);
  };

  const columns = getColumns(handleEdit, setDeleteId);

  const projects = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your game projects and their settings.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <ServerDataTable
        columns={columns}
        data={projects}
        searchPlaceholder="Search projects..."
        onSearch={handleSearch}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        onPageChange={handlePageChange}
        hasNextPage={!data?.isLast}
        hasPrevPage={currentPage > 0}
        isLoading={isFetching}
        currentPage={currentPage}
        totalPages={data?.totalPages}
        totalElements={data?.totalElements}
        limit={limit}
        onLimitChange={setLimit}
        sorting={sorting}
        onSortingChange={setSorting}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        onRefresh={refetch}
      />

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        project={selectedProject}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
        description="This will permanently delete the project and all associated folders and questions."
      />
    </div>
  );
}
