import { cn } from "@/utils/cn";

// Placeholder block while content loads; size it with className
const Skeleton = ({ className = "h-4 w-full" }) => (
  <span
    aria-hidden="true"
    className={cn("block animate-pulse rounded-md bg-surface-muted", className)}
  />
);

export default Skeleton;
