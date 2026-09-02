import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/types/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings2, Trash2, ArrowUpDown } from "lucide-react";

export const getColumns = (
  onEdit: (user: User) => void,
  onDelete: (id: string) => void
): ColumnDef<User>[] => [
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium ml-4 max-w-[200px] truncate" title={row.getValue("email")}>{row.getValue("email")}</div>,
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
      header: () => <div className="text-right">Assigned Projects</div>,
      cell: ({ row }) => {
        const projectIds = row.getValue("projectIds") as string[];
        if (row.getValue("role") !== "SUPER_ADMIN" && (!projectIds || projectIds.length === 0)) return <div className="text-right mr-4 text-muted-foreground text-sm">None</div>;
        return <div className="text-right mr-4">{row.getValue("role") == "SUPER_ADMIN" ? "All" : projectIds.length} Projects</div>;
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
            <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
              <Settings2 className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(user.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
