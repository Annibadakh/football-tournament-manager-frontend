import { cn } from "@/utils/cn";

const VARIANTS = {
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200",
  accent: "bg-accent-50 text-accent-700 dark:bg-accent-900 dark:text-accent-200",
  neutral: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-200",
  success: "bg-brand-50 text-success dark:bg-brand-900 dark:text-brand-200",
  warning: "bg-amber-100 text-warning dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-red-50 text-danger dark:bg-red-950 dark:text-red-300",
  info: "bg-blue-50 text-info dark:bg-blue-950 dark:text-blue-300",
  live: "bg-live text-white",
};

const SIZES = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

const Badge = ({ variant = "neutral", size = "md", icon = null, className = "", children }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap",
      VARIANTS[variant] ?? VARIANTS.neutral,
      SIZES[size] ?? SIZES.md,
      className,
    )}
  >
    {/* Live badges get a pulsing dot so live matches stand out in lists */}
    {variant === "live" && (
      <span className="relative flex size-1.5" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-white" />
      </span>
    )}
    {icon}
    {children}
  </span>
);

export default Badge;
