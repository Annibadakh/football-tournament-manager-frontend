import { useCallback, useMemo, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/constants/common.constants";

const resolveUpdater = (updater, previous) =>
  typeof updater === "function" ? updater(previous) : updater;

/**
 * Holds server-side table state (page, size, sort, search) in TanStack's shape
 * and exposes the matching API query params.
 */
const useServerTable = ({ pageSize = DEFAULT_PAGE_SIZE, sorting = [] } = {}) => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  const [sortingState, setSortingState] = useState(sorting);
  const [search, setSearchState] = useState("");

  // New sort or search changes the result set, so go back to the first page
  const onSortingChange = useCallback((updater) => {
    setSortingState((previous) => resolveUpdater(updater, previous));
    setPagination((previous) => ({ ...previous, pageIndex: 0 }));
  }, []);

  const setSearch = useCallback((value) => {
    setSearchState(value);
    setPagination((previous) => ({ ...previous, pageIndex: 0 }));
  }, []);

  const onPaginationChange = useCallback((updater) => {
    setPagination((previous) => resolveUpdater(updater, previous));
  }, []);

  const queryParams = useMemo(() => {
    const [firstSort] = sortingState;
    return {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      ...(firstSort && { sortBy: firstSort.id, sortOrder: firstSort.desc ? "desc" : "asc" }),
      ...(search && { search }),
    };
  }, [pagination, sortingState, search]);

  return {
    tableState: { pagination, sorting: sortingState },
    onPaginationChange,
    onSortingChange,
    search,
    setSearch,
    queryParams,
  };
};

export default useServerTable;
