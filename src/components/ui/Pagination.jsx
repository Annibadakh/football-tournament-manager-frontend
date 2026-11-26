import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/constants/common.constants";
import { formatNumber } from "@/utils/number";
import { cn } from "@/utils/cn";
import { ELLIPSIS, getPageNumbers } from "@/utils/pagination";

const pageButtonClass =
  "inline-flex size-9 items-center justify-center rounded-lg text-sm font-semibold text-fg hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40";

const Pagination = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className = "",
}) => {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3 text-sm", className)}
    >
      <p className="text-fg-muted">
        Showing <span className="font-semibold text-fg">{formatNumber(firstItem)}</span>–
        <span className="font-semibold text-fg">{formatNumber(lastItem)}</span> of{" "}
        <span className="font-semibold text-fg">{formatNumber(total)}</span>
      </p>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-fg-muted">
            Rows
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-9 rounded-lg border border-line bg-surface px-2 text-fg"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={pageButtonClass}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          {getPageNumbers(page, totalPages).map((item, index) =>
            item === ELLIPSIS ? (
              <span key={`ellipsis-${index}`} className="px-1 text-fg-muted" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  pageButtonClass,
                  "hidden sm:inline-flex",
                  item === page && "bg-brand-600 text-white hover:bg-brand-700 sm:inline-flex",
                )}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            className={pageButtonClass}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Pagination;
