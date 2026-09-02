import { ColumnDef } from "@tanstack/react-table";
import { Question } from "@/lib/types/question";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export const getColumns = (
  onEdit: (question: Question) => void,
  onDelete: (id: string) => void
): ColumnDef<Question>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="px-1 w-[40px]">
        <input
          type="checkbox"
          className="rounded border-zinc-300 dark:border-zinc-700 bg-transparent"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-1">
        <input
          type="checkbox"
          className="rounded border-zinc-300 dark:border-zinc-700 bg-transparent"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "question",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
        >
          Question
          {isSorted === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : isSorted === "desc" ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium ml-4 max-w-[250px] truncate" title={row.getValue("question")}>
        {row.getValue("question")}
      </div>
    ),
  },
  {
    accessorKey: "options",
    header: "Options",
    cell: ({ row }) => {
      const options = row.getValue("options") as string[] | undefined;
      if (!options || options.length === 0) return <span className="text-muted-foreground text-sm">None</span>;
      return <Badge variant="secondary">{options.length} options</Badge>;
    },
  },
  {
    accessorKey: "difficulty",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
        >
          Difficulty
          {isSorted === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : isSorted === "desc" ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
    cell: ({ row }) => {
      const diff = row.getValue("difficulty") as string;
      const getBadgeVariant = () => {
        switch (diff) {
          case "EASY": return "secondary";
          case "MEDIUM": return "default";
          case "HARD": return "destructive";
          default: return "outline";
        }
      };
      return <Badge variant={getBadgeVariant()} className="ml-4">{diff}</Badge>;
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
        >
          Type
          {isSorted === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : isSorted === "desc" ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
    cell: ({ row }) => <div className="ml-4">{row.getValue("type")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Created At
            {isSorted === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : isSorted === "desc" ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
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
      const question = row.original;
      return (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(question)}>
            <Settings2 className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(question.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
