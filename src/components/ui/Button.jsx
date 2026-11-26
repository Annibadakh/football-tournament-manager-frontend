import Spinner from "@/components/ui/Spinner";
import { cn } from "@/utils/cn";

const VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
  // Orange always carries dark text (white on orange fails contrast)
  accent: "bg-accent-500 text-ink-950 hover:bg-accent-400 active:bg-accent-600",
  secondary: "bg-surface-muted text-fg hover:bg-line",
  success: "bg-success text-white hover:bg-brand-700",
  danger: "bg-danger text-white hover:bg-red-700",
  warning: "bg-warning text-white hover:bg-amber-800",
  outline:
    "border border-brand-600 text-brand-700 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-300 dark:hover:bg-brand-950",
  ghost: "text-fg hover:bg-surface-muted",
};

const SIZES = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon = null,
  endIcon = null,
  className = "",
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {/* Content stays in the layout while loading so the button keeps its width */}
      <span className={cn("inline-flex items-center gap-[inherit]", loading && "invisible")}>
        {startIcon}
        {children}
        {endIcon}
      </span>
      {loading && <Spinner size="sm" className="absolute" label="Please wait" />}
    </button>
  );
};

export default Button;
