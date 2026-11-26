import {
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

// Declared once outside the component, as TanStack Table v9 recommends
const features = tableFeatures({ rowSortingFeature, rowPaginationFeature });

const SKELETON_ROWS = 5;

const SortIcon = ({ direction }) => {
  if (direction === "asc") return <ArrowUp className="size-3.5" aria-hidden="true" />;
  if (direction === "desc") return <ArrowDown className="size-3.5" aria-hidden="true" />;
  return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />;
};

/**
 * Server-side table: the API does paging and sorting, this only renders.
 * Pair with useServerTable() for state and query params.
 */
const DataTable = ({
  columns,
  data = [],
  total = 0,
  state,
  onPaginationChange,
  onSortingChange,
  loading = false,
  toolbar = null,
  emptyState = <EmptyState title="Nothing here yet" description="No records match your filters." />,
  getRowId,
  className = "",
}) => {
  const table = useTable({
    features,
    columns,
    data,
    getRowId,
    state,
    onPaginationChange,
    onSortingChange,
    manualPagination: true,
    manualSorting: true,
    rowCount: total,
  });

  const { pageIndex, pageSize } = state.pagination;
  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const columnCount = headerGroups[0]?.headers.length ?? columns.length;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-left text-sm" aria-busy={loading}>
          <thead className="sticky top-0 bg-surface-muted text-xs tracking-wide text-fg-muted uppercase">
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const direction = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={direction ? `${direction}ending` : undefined}
                      className="px-4 py-3 font-semibold whitespace-nowrap"
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase hover:text-fg"
                        >
                          <table.FlexRender header={header} />
                          <SortIcon direction={direction} />
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-line text-fg">
            {loading &&
              Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {Array.from({ length: columnCount }, (_, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading &&
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-muted/60">
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columnCount}>{emptyState}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <Pagination
          page={pageIndex + 1}
          pageSize={pageSize}
          total={total}
          onPageChange={(page) => onPaginationChange?.({ pageIndex: page - 1, pageSize })}
          onPageSizeChange={(size) => onPaginationChange?.({ pageIndex: 0, pageSize: size })}
        />
      )}
    </div>
  );
};

export default DataTable;
