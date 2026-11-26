import { useId } from "react";
import { cn } from "@/utils/cn";

const Switch = ({
  name,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  const id = `${useId()}-${name}`;

  return (
    <div
      className={cn("flex items-start justify-between gap-4", disabled && "opacity-60", className)}
    >
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-semibold text-fg">{label}</span>
        {description && <span className="block text-xs text-fg-muted">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        disabled={disabled}
        onClick={() => onChange?.(name, !checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed",
          checked ? "bg-brand-600" : "bg-ink-300 dark:bg-ink-700",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
};

export default Switch;
