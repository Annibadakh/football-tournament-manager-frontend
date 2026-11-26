import { cn } from "@/utils/cn";

// Controlled tabs: items = [{ value, label }]; arrow keys move between tabs
const Tabs = ({ items, value, onChange, className = "" }) => {
  const handleKeyDown = (event) => {
    const index = items.findIndex((item) => item.value === value);
    if (event.key === "ArrowRight") onChange(items[(index + 1) % items.length].value);
    if (event.key === "ArrowLeft") onChange(items[(index - 1 + items.length) % items.length].value);
  };

  return (
    <div
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn("flex gap-1 overflow-x-auto border-b border-line", className)}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
              isActive
                ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
                : "border-transparent text-fg-muted hover:text-fg",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
