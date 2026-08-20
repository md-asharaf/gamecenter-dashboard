"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings2, Trash2, Folder as FolderIcon, Trash, Eraser, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Project, ApiResponse } from "@/lib/types/project";
import { Folder, FolderPageResponse } from "@/lib/types/folder";
import { getFolders, deleteFolder, emptyFolder } from "@/lib/api/folder";
import { api } from "@/lib/api/axios";
import { ServerDataTable } from "@/components/ui/server-data-table";
import { FolderDialog } from "./components/folder-dialog";
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
import { Loader2 } from "lucide-react";

export function FoldersClient({ projectId, project: initialProject }: { projectId: string; project: Project | null }) {
  const queryClient = useQueryClient();

  const { data: projectData } = useQuery<ApiResponse<Project>>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
      return res.data;
    },
    initialData: initialProject ? { success: true as const, data: initialProject } : undefined,
    staleTime: 0,
  });

  const project: Project | null = projectData?.data ?? initialProject;

  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [emptyId, setEmptyId] = useState<string | null>(null);

  const [limit] = useState(10);
  const [keyHistory, setKeyHistory] = useState<string[]>([]);
  const currentKey = keyHistory[keyHistory.length - 1];

  const { data: pageData, isFetching } = useQuery<FolderPageResponse>({
    queryKey: ["folders", projectId, limit, currentKey],
    queryFn: () => getFolders(projectId, limit, currentKey),
  });

  const folders = pageData?.items || [];

  const handleNextPage = () => {
    if (pageData?.lastEvaluatedKey) {
      setKeyHistory((prev) => [...prev, pageData.lastEvaluatedKey!]);
    }
  };

  const handlePrevPage = () => {
    setKeyHistory((prev) => prev.slice(0, -1));
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteFolder(projectId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", projectId] });
      toast.success("Folder deleted successfully.");
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error("Failed to delete folder.", {
        description: error.response?.data?.message || "An error occurred.",
      });
      setDeleteId(null);
    },
  });

  const emptyMutation = useMutation({
    mutationFn: async (id: string) => {
      await emptyFolder(projectId, id);
    },
    onSuccess: () => {
      toast.success("Folder emptied successfully.");
      setEmptyId(null);
    },
    onError: (error: any) => {
      toast.error("Failed to empty folder.", {
        description: error.response?.data?.message || "An error occurred.",
      });
      setEmptyId(null);
    },
  });

  const handleEdit = (folder: Folder) => {
    setSelectedFolder(folder);
    setIsFolderDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedFolder(null);
    setIsFolderDialogOpen(true);
  };

  const columns: ColumnDef<Folder>[] = [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center">
          <FolderIcon className="mr-2 h-4 w-4 text-blue-500" />
          <Link href={`/projects/${projectId}/folders/${row.original.id}`} className="hover:underline text-primary font-medium">
            {row.original.name}
          </Link>
          {project?.quizFolderId === row.original.id && (
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">Active Quiz</span>
          )}
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <span>{new Date(row.original.createdAt).toLocaleString()}</span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const folder = row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(folder)}>
              <Settings2 className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEmptyId(folder.id)}>
              <Eraser className="h-4 w-4 mr-2" /> Empty
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteId(folder.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project?.name || "Project"} Folders</h1>
            <p className="text-muted-foreground mt-1">
              Organize questions into folders. Select an active quiz folder in project settings.
            </p>
          </div>
        </div>
        <div className="flex w-full sm:w-auto space-x-2">
          <Button className="flex-1 sm:flex-none" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Folder
          </Button>
        </div>
      </div>

      <ServerDataTable
        columns={columns}
        data={folders}
        isLoading={isFetching}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        hasNextPage={!!pageData?.lastEvaluatedKey}
        hasPrevPage={keyHistory.length > 0}
      />

      <FolderDialog
        open={isFolderDialogOpen}
        onOpenChange={setIsFolderDialogOpen}
        folder={selectedFolder}
        projectId={projectId}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this folder and ALL questions inside it. This action cannot be undone.
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
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Folder"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!emptyId} onOpenChange={() => setEmptyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all questions inside this folder. The folder itself will remain. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={emptyMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (emptyId) emptyMutation.mutate(emptyId);
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={emptyMutation.isPending}
            >
              {emptyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Empty Folder"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
