import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import { SEARCH_DEBOUNCE_MS } from "@/constants/common.constants";
import { cn } from "@/utils/cn";

const SearchInput = ({
  onSearch,
  placeholder = "Search...",
  defaultValue = "",
  delay = SEARCH_DEBOUNCE_MS,
  className = "",
  ...rest
}) => {
  const [value, setValue] = useState(defaultValue);
  const debouncedValue = useDebounce(value.trim(), delay);
  const onSearchRef = useRef(onSearch);
  const isFirstRun = useRef(true);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Skip the initial value so mounting doesn't trigger a duplicate fetch
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    onSearchRef.current?.(debouncedValue);
  }, [debouncedValue]);

  return (
    <div
      className={cn(
        "flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3",
        "focus-within:border-brand-600 dark:focus-within:border-brand-400",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-fg-muted" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={rest["aria-label"] ?? placeholder}
        className="h-full w-full min-w-0 bg-transparent text-sm text-fg outline-none placeholder:text-fg-muted/70 [&::-webkit-search-cancel-button]:hidden"
        {...rest}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="rounded p-0.5 text-fg-muted hover:text-fg"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
