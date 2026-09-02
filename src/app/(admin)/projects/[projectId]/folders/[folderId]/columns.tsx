import { ColumnDef } from "@tanstack/react-table";
import { Question } from "@/lib/types/question";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings2, Trash2, ArrowUpDown } from "lucide-react";

export const getColumns = (
  onEdit: (question: Question) => void,
  onDelete: (id: string) => void
): ColumnDef<Question>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "question",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Question
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <span className="font-medium ml-4 max-w-[200px] sm:max-w-[300px] lg:max-w-[400px] truncate block" title={row.original.question}>{row.original.question || "—"}</span>,
  },
  {
    accessorKey: "answer",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Answer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <span className="ml-4 max-w-[150px] sm:max-w-[250px] truncate block" title={row.original.answer}>{row.original.answer || "—"}</span>,
  },
  {
    accessorKey: "hint",
    header: "Hint",
    cell: ({ row }) => <span className="text-muted-foreground max-w-[150px] truncate block" title={row.original.hint || ""}>{row.original.hint || "—"}</span>,
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
