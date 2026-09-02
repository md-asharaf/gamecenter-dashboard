import { useState, useCallback } from "react";
import { SortingState, VisibilityState, RowSelectionState } from "@tanstack/react-table";

export function useTablePagination(initialPage = 0, initialLimit = 10, initialSearch = "") {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(0);
  }, []);

  const handleNextPage = useCallback((isLast?: boolean) => {
    if (!isLast) setCurrentPage((p) => p + 1);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((p) => (p > 0 ? p - 1 : 0));
  }, []);

  return {
    currentPage,
    limit,
    search,
    sorting,
    columnVisibility,
    rowSelection,
    handleSearch,
    handleNextPage,
    handlePrevPage,
    setCurrentPage,
    setLimit,
    setSearch,
    setSorting,
    setColumnVisibility,
    setRowSelection,
  };
}
