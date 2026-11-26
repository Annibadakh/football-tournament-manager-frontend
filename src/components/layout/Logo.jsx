import { Link } from "react-router-dom";
import logoIcon from "@/assets/brand/maidaan-icon.svg";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/utils/cn";

const SIZES = {
  sm: { icon: "size-8", text: "text-xl" },
  md: { icon: "size-10", text: "text-2xl" },
  lg: { icon: "size-20", text: "text-5xl" },
};

// Icon + wordmark; the "aa" uses the accent shade that passes contrast in each theme
const Logo = ({ size = "md", to = ROUTES.HOME, className = "" }) => {
  const { icon, text } = SIZES[size] ?? SIZES.md;

  return (
    <Link
      to={to}
      aria-label="Maidaan home"
      className={cn("inline-flex items-center gap-2", className)}
    >
      <img src={logoIcon} alt="" className={cn(icon, "rounded-[22%]")} />
      <span className={cn("font-brand leading-none font-extrabold text-fg", text)}>
        Maid<span className="text-accent-600 dark:text-accent-500">aa</span>n
      </span>
    </Link>
  );
};

export default Logo;
