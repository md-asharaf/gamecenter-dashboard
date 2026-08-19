"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/axios";
import { User } from "@/lib/types/user";
import { UserDialog } from "./components/user-dialog";
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
import { Badge } from "@/components/ui/badge";

export function UsersClient() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isFetching } = useQuery<{ data: { items: User[]; lastEvaluatedKey: string | null } }>({
    queryKey: ["users", currentCursor, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", "10");
      if (currentCursor) params.append("lastEvaluatedKey", currentCursor);
      if (search) params.append("search", search);

      const res = await api.get(`/admins?${params.toString()}`);
      return res.data;
    },
  });

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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admins/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Sub-admin deleted successfully.");
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error("Failed to delete sub-admin.", {
        description: error.response?.data?.message || error.message,
      });
      setDeleteId(null);
    },
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="font-medium">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant={row.getValue("role") === "SUPER_ADMIN" ? "default" : "secondary"}>
          {row.getValue("role") === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"}
        </Badge>
      ),
    },
    {
      accessorKey: "projectIds",
      header: "Assigned Projects",
      cell: ({ row }) => {
        const projectIds = row.getValue("projectIds") as string[];
        if (!projectIds || projectIds.length === 0) return <span className="text-muted-foreground text-sm">None</span>;
        return <span>{projectIds.length} projects</span>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const user = row.original;
        if (user.role === "SUPER_ADMIN") return null;
        return (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
              <Settings2 className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteId(user.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const users = data?.data.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
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
        searchPlaceholder="Search users by email or name..."
        onSearch={handleSearch}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        hasNextPage={!!data?.data.lastEvaluatedKey}
        hasPrevPage={history.length > 0}
        isLoading={isFetching}
      />

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this sub-admin account.
              They will lose access to all assigned projects immediately.
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
