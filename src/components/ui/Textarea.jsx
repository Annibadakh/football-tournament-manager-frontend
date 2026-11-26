import { useId } from "react";
import FieldWrapper from "@/components/ui/FieldWrapper";

const Textarea = ({
  name,
  label,
  value,
  onChange,
  placeholder = "",
  rows = 3,
  maxLength,
  error,
  helperText,
  required = false,
  disabled = false,
  className = "",
}) => {
  const id = `${useId()}-${name}`;
  const length = value?.length ?? 0;
  const counter = maxLength ? `${length}/${maxLength}` : null;

  return (
    <FieldWrapper
      id={id}
      label={label}
      required={required}
      error={error}
      helperText={helperText ?? counter}
      disabled={disabled}
      className={className}
    >
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value ?? ""}
        maxLength={maxLength}
        onChange={(event) => onChange?.(name, event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText || counter ? `${id}-message` : undefined}
        className="w-full resize-y bg-transparent py-1 text-sm text-fg outline-none placeholder:text-fg-muted/70"
      />
    </FieldWrapper>
  );
};

export default Textarea;
