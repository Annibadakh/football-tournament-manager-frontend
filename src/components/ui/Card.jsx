import { cn } from "@/utils/cn";

const Card = ({
  title,
  subtitle,
  actions,
  footer,
  className = "",
  bodyClassName = "",
  children,
}) => {
  const hasHeader = title || subtitle || actions;

  return (
    <section className={cn("rounded-xl border border-line bg-surface shadow-sm", className)}>
      {hasHeader && (
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && <h3 className="truncate text-lg leading-tight text-fg">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-fg-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
      {footer && <footer className="border-t border-line px-4 py-3">{footer}</footer>}
    </section>
  );
};

export default Card;
