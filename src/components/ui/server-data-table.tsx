/* eslint-disable react-hooks/incompatible-library */
"use client";
"use no memo";

import { useState, useEffect, useRef } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowSelectionState,
  OnChangeFn,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, RefreshCw, PackageOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServerDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  isLoading?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  CustomActions?: React.ReactNode;
  onRefresh?: () => void;
}

export function ServerDataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  onSearch,
  onNextPage,
  onPrevPage,
  hasNextPage = false,
  hasPrevPage = false,
  isLoading = false,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  currentPage,
  totalPages,
  totalElements,
  limit = 10,
  onLimitChange,
  sorting,
  onSortingChange,
  columnVisibility,
  onColumnVisibilityChange,
  CustomActions,
  onRefresh,
}: ServerDataTableProps<TData, TValue>) {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);

  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (onSearchRef.current) {
      onSearchRef.current(debouncedSearch);
    }
  }, [debouncedSearch]);

  const table =
    useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      enableRowSelection,
      onRowSelectionChange,
      onSortingChange,
      onColumnVisibilityChange,
      manualSorting: true,
      manualPagination: true,
      state: {
        rowSelection: rowSelection || {},
        sorting: sorting || [],
        columnVisibility: columnVisibility || {},
      },
    });

  const showPageInfo = totalPages !== undefined && currentPage !== undefined;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 w-full gap-4">
        {onSearch ? (
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="pl-8 w-full"
            />
          </div>
        ) : <div />}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {CustomActions}
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh} aria-label="Refresh data">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "outline" }) + " ml-auto"}>
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border bg-white dark:bg-zinc-900 shadow-sm relative">
        {isLoading && data.length > 0 && (
          <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center backdrop-blur-sm">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-64 text-center"
                >
                  {isLoading ? (
                    <div className="space-y-6 py-4 flex flex-col items-center justify-center w-full">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center space-x-4 w-full px-8 opacity-50">
                          <Skeleton className="h-4 w-[10%]" />
                          <Skeleton className="h-4 w-[40%]" />
                          <Skeleton className="h-4 w-[30%]" />
                          <Skeleton className="h-4 w-[20%]" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <PackageOpen className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
                      <p className="text-lg font-medium">No results found.</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        {onLimitChange && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${limit}`}
              onValueChange={(value) => {
                onLimitChange(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[6, 8, 10, 12, 20].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {showPageInfo && (
          <div className="flex w-40 items-center justify-center text-sm font-medium">
            Page {(currentPage ?? 0) + 1} of {totalPages ?? 1}
            {totalElements !== undefined && ` (${totalElements} total)`}
          </div>
        )}
        <div className="flex items-center space-x-2 ml-auto">
          <Button
            variant="outline"
            className="h-8 px-4"
            onClick={() => onPrevPage?.()}
            disabled={!hasPrevPage || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="h-8 px-4"
            onClick={() => onNextPage?.()}
            disabled={!hasNextPage || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
