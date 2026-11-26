import { cn } from "@/utils/cn";

/**
 * Shared label + bordered box + error/helper layout for form controls,
 * so FormInput, Select and future controls look like one design unit.
 */
const FieldWrapper = ({
  id,
  label,
  required = false,
  error,
  helperText,
  disabled = false,
  focusWithin = true,
  className = "",
  children,
}) => {
  const messageId = `${id}-message`;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        className={cn(
          "rounded-lg border bg-surface px-3 pt-1.5 pb-1 transition-colors",
          focusWithin && "focus-within:border-brand-600 dark:focus-within:border-brand-400",
          error ? "border-danger" : "border-line",
          disabled && "opacity-60",
        )}
      >
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-fg-muted">
            {label}
            {required && <span className="ml-0.5 text-danger">*</span>}
          </label>
        )}
        {children}
      </div>
      {(error || helperText) && (
        <p id={messageId} className={cn("px-1 text-xs", error ? "text-danger" : "text-fg-muted")}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default FieldWrapper;
