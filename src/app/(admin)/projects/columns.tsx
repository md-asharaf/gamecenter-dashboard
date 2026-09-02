import { ColumnDef } from "@tanstack/react-table";
import { Project } from "@/lib/types/project";
import { Button } from "@/components/ui/button";
import { Settings2, Trash2, FolderOpen, ArrowUpDown } from "lucide-react";
import Link from "next/link";

export const getColumns = (
  onEdit: (project: Project) => void,
  onDelete: (id: string) => void
): ColumnDef<Project>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Link href={`/projects/${row.original.id}`} className="hover:underline text-primary font-medium ml-4 max-w-[200px] truncate block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm transition-colors" title={row.getValue("name")}>
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div className="text-right mr-4">{new Date(row.getValue("createdAt")).toLocaleString()}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex justify-end space-x-2">
          <Link href={`/projects/${project.id}`}>
            <Button variant="outline" size="sm">
              <FolderOpen className="h-4 w-4 mr-2" /> Folders
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
            <Settings2 className="h-4 w-4 mr-2" /> Settings
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(project.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
