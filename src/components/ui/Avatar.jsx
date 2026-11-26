import { cn } from "@/utils/cn";

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl",
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

// Photo when available, otherwise initials on a brand-tinted circle
const Avatar = ({ src, name, size = "md", className = "" }) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-brand font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-200",
      SIZES[size] ?? SIZES.md,
      className,
    )}
  >
    {src ? (
      <img src={src} alt={name ? `${name}'s photo` : ""} className="size-full object-cover" />
    ) : (
      getInitials(name)
    )}
  </span>
);

export default Avatar;
