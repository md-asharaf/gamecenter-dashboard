"use client";
import { AxiosError } from "axios";
import { getApiErrorMessage, ApiError } from "@/lib/api/api-error";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/axios";
import { Project } from "@/lib/types/project";
import { ProjectDialog } from "./components/project-dialog";
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

export function ProjectsClient() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isFetching } = useQuery<{ data: { items: Project[]; lastEvaluatedKey: string | null } }>({
    queryKey: ["projects", currentCursor, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", "10");
      if (currentCursor) params.append("lastEvaluatedKey", currentCursor);
      if (search) params.append("search", search);

      const res = await api.get(`/projects?${params.toString()}`);
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
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully.");
      setDeleteId(null);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error("Failed to delete project.", {
        description: getApiErrorMessage(error),
      });
      setDeleteId(null);
    },
  });

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedProject(null);
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link href={`/projects/${row.original.id}`} className="hover:underline text-primary font-medium">
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "field1Label",
      header: "Label 1",
    },
    {
      accessorKey: "field2Label",
      header: "Label 2",
    },
    {
      accessorKey: "field3Label",
      header: "Label 3",
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>
              <Settings2 className="h-4 w-4 mr-2" /> Configure
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteId(project.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const projects = data?.data.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your game projects and configurations.
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      <ServerDataTable 
        columns={columns} 
        data={projects} 
        searchPlaceholder="Search projects by name..." 
        onSearch={handleSearch}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        hasNextPage={!!data?.data.lastEvaluatedKey}
        hasPrevPage={history.length > 0}
        isLoading={isFetching}
      />

      <ProjectDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        project={selectedProject} 
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project and all of its associated questions.
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
