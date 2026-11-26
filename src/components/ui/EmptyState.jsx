import { Inbox } from "lucide-react";
import { cn } from "@/utils/cn";

const EmptyState = ({ icon: Icon = Inbox, title, description, action, className = "" }) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-3 px-4 py-12 text-center",
      className,
    )}
  >
    <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900 dark:text-brand-300">
      <Icon className="size-6" aria-hidden="true" />
    </span>
    <div>
      <p className="font-brand text-lg font-bold text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-fg-muted">{description}</p>}
    </div>
    {action}
  </div>
);

export default EmptyState;
