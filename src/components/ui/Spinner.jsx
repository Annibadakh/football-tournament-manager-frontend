import { cn } from "@/utils/cn";

const SIZES = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-10 border-[3px]",
};

const Spinner = ({ size = "md", label = "Loading", className = "" }) => (
  <span
    role="status"
    aria-label={label}
    className={cn(
      "inline-block animate-spin rounded-full border-current border-t-transparent",
      SIZES[size] ?? SIZES.md,
      className,
    )}
  />
);

export default Spinner;
