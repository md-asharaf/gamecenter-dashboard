import { ColumnDef } from "@tanstack/react-table";
import { Folder } from "@/lib/types/folder";
import { Project } from "@/lib/types/project";
import { Button } from "@/components/ui/button";
import { Settings2, Trash2, Eraser, Folder as FolderIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

export const getColumns = (
  projectId: string,
  project: Project | null | undefined,
  onMakeActive: (id: string) => void,
  onEdit: (folder: Folder) => void,
  onEmpty: (id: string) => void,
  onDelete: (id: string) => void,
  isUpdatingProject: boolean
): ColumnDef<Folder>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting()}
        >
          Name
          {isSorted === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : isSorted === "desc" ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center ml-4">
        <FolderIcon className="mr-2 h-4 w-4 text-blue-500" />
        <Link href={`/projects/${projectId}/folders/${row.original.id}`} className="hover:underline text-primary font-medium max-w-[200px] truncate block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm transition-colors" title={row.original.name}>
          {row.original.name}
        </Link>
        {project?.quizFolderId === row.original.id && (
          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">Active</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
          >
            Created At
            {isSorted === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : isSorted === "desc" ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      )
    },
    cell: ({ row }) => (
      <div className="text-right mr-4">{new Date(row.original.createdAt).toLocaleString()}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const folder = row.original;
      const isActive = project?.quizFolderId === folder.id;
      return (
        <div className="flex justify-end space-x-2">
          {!isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMakeActive(folder.id)}
              disabled={isUpdatingProject}
            >
              Make Active
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onEdit(folder)}>
            <Settings2 className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEmpty(folder.id)}>
            <Eraser className="h-4 w-4 mr-2" /> Empty
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(folder.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
