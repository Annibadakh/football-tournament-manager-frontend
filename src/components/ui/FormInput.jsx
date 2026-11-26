import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import FieldWrapper from "@/components/ui/FieldWrapper";
import { cn } from "@/utils/cn";

const FormInput = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error,
  helperText,
  required = false,
  disabled = false,
  startIcon = null,
  endIcon = null,
  className = "",
  ...rest
}) => {
  const id = `${useId()}-${name}`;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && isPasswordVisible ? "text" : type;

  return (
    <FieldWrapper
      id={id}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      disabled={disabled}
      className={className}
    >
      <div className="flex items-center gap-2">
        {startIcon && <span className="text-fg-muted">{startIcon}</span>}
        <input
          id={id}
          name={name}
          type={inputType}
          value={value ?? ""}
          onChange={(event) => onChange?.(name, event.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helperText ? `${id}-message` : undefined}
          className={cn(
            "h-8 w-full min-w-0 bg-transparent text-sm text-fg outline-none placeholder:text-fg-muted/70",
            "disabled:cursor-not-allowed",
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="rounded p-1 text-fg-muted hover:text-fg"
          >
            {isPasswordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
        {endIcon && <span className="text-fg-muted">{endIcon}</span>}
      </div>
    </FieldWrapper>
  );
};

export default FormInput;
