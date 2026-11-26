import { cn } from "@/utils/cn";

const PageHeader = ({ title, subtitle, actions, className = "" }) => (
  <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-3", className)}>
    <div className="min-w-0">
      <h1 className="text-2xl leading-tight text-fg sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
