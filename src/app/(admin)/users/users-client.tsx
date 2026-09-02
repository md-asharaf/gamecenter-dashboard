"use client";
import { AxiosError } from "axios";
import { getApiErrorMessage, ApiError } from "@/lib/api/api-error";

import { useState } from "react";
import { useAdmins, useDeleteAdmin } from "@/lib/hooks/use-admins";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { User } from "@/lib/types/user";

import { UserDialog } from "./components/user-dialog";
import { ServerDataTable } from "@/components/ui/server-data-table";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { getColumns } from "./columns";

export function UsersClient() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const { data: pageData, isFetching, refetch } = useAdmins(currentPage, limit, search, sortBy, sortDir);

  const deleteMutation = useDeleteAdmin();
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Sub-admin deleted successfully.");
        setDeleteId(null);
      },
      onError: (error) => {
        toast.error("Failed to delete sub-admin.", {
          description: getApiErrorMessage(error as AxiosError<ApiError>),
        });
        setDeleteId(null);
      },
    });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const columns = getColumns(handleEdit, setDeleteId);

  const users = pageData?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admins</h1>
          <p className="text-muted-foreground mt-1">
            Manage sub-admins and their project access.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Sub-Admin
        </Button>
      </div>

      <ServerDataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search users by email..."
        onSearch={handleSearch}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        onPageChange={handlePageChange}
        hasNextPage={!pageData?.isLast}
        hasPrevPage={currentPage > 0}
        isLoading={isFetching}
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

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId);
        }}
        isPending={deleteMutation.isPending}
        description="This will permanently delete this sub-admin account. They will lose access to all assigned projects immediately."
      />
    </div>
  );
}
