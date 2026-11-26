import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import FieldWrapper from "@/components/ui/FieldWrapper";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/utils/cn";

const Select = ({
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  searchable = false,
  clearable = false,
  loading = false,
  error,
  helperText,
  required = false,
  disabled = false,
  emptyMessage = "No options found",
  className = "",
}) => {
  const id = `${useId()}-${name}`;
  const listboxId = `${id}-listbox`;
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption = options.find((option) => option.value === value);

  const visibleOptions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, query]);

  const openList = () => {
    if (disabled) return;
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(Math.max(selectedIndex, 0));
    setQuery("");
    setIsOpen(true);
  };

  const closeList = ({ restoreFocus = true } = {}) => {
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const selectOption = (option) => {
    onChange?.(name, option.value);
    closeList();
  };

  // Close when clicking anywhere outside the control
  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) closeList({ restoreFocus: false });
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable) searchRef.current?.focus();
  }, [isOpen, searchable]);

  const handleKeyDown = (event) => {
    if (!isOpen) {
      if (["ArrowDown", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeList();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, visibleOptions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && visibleOptions[activeIndex]) {
      event.preventDefault();
      selectOption(visibleOptions[activeIndex]);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)} onKeyDown={handleKeyDown}>
      <FieldWrapper
        id={id}
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        disabled={disabled}
      >
        <div className="flex items-center gap-1">
          <button
            ref={triggerRef}
            id={id}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-invalid={Boolean(error)}
            disabled={disabled}
            onClick={() => (isOpen ? closeList() : openList())}
            className="flex h-8 w-full min-w-0 items-center text-left text-sm outline-none disabled:cursor-not-allowed"
          >
            <span className={cn("truncate", selectedOption ? "text-fg" : "text-fg-muted/70")}>
              {selectedOption?.label ?? placeholder}
            </span>
          </button>
          {clearable && selectedOption && !disabled && (
            <button
              type="button"
              onClick={() => onChange?.(name, null)}
              aria-label={`Clear ${label ?? "selection"}`}
              className="rounded p-1 text-fg-muted hover:text-fg"
            >
              <X className="size-4" />
            </button>
          )}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 text-fg-muted transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </FieldWrapper>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
          {searchable && (
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              placeholder="Type to filter..."
              aria-label="Filter options"
              className="w-full border-b border-line bg-transparent px-3 py-2 text-sm text-fg outline-none"
            />
          )}
          <ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="max-h-60 overflow-y-auto py-1"
          >
            {loading && (
              <li className="flex items-center gap-2 px-3 py-2 text-sm text-fg-muted">
                <Spinner size="sm" /> Loading...
              </li>
            )}
            {!loading && visibleOptions.length === 0 && (
              <li className="px-3 py-2 text-sm text-fg-muted">{emptyMessage}</li>
            )}
            {!loading &&
              visibleOptions.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectOption(option)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between px-3 py-2 text-sm text-fg",
                      index === activeIndex && "bg-surface-muted",
                      isSelected && "font-semibold text-brand-700 dark:text-brand-300",
                    )}
                  >
                    {option.label}
                    {isSelected && <Check className="size-4" aria-hidden="true" />}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Select;
