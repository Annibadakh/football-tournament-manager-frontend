import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";

/**
 * items: [{ to, label, icon: LucideIcon, roles? }]; links without roles show for everyone.
 * Role filtering is UX only; the API enforces permissions.
 */
const Sidebar = ({ items = [], userRole, isOpen, onNavigate }) => {
  const visibleItems = items.filter((item) => !item.roles || item.roles.includes(userRole));

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r border-line bg-surface pt-16 transition-transform lg:static lg:z-auto lg:translate-x-0 lg:pt-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <nav aria-label="Dashboard" className="flex flex-col gap-1 p-3">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200"
                  : "text-fg-muted hover:bg-surface-muted hover:text-fg",
              )
            }
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
