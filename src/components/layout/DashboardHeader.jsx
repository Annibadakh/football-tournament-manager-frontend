import { Menu } from "lucide-react";
import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { ROUTES } from "@/constants/routes.constants";

const DashboardHeader = ({ onToggleSidebar, rightSlot = null }) => (
  <header className="sticky top-0 z-50 flex h-16 items-center gap-3 border-b border-line bg-surface px-4">
    <button
      type="button"
      onClick={onToggleSidebar}
      aria-label="Toggle navigation"
      className="rounded-lg p-2 text-fg-muted hover:bg-surface-muted hover:text-fg lg:hidden"
    >
      <Menu className="size-5" />
    </button>
    <Logo size="sm" to={ROUTES.DASHBOARD} />
    <div className="ml-auto flex items-center gap-3">
      <ThemeToggle />
      {rightSlot}
    </div>
  </header>
);

export default DashboardHeader;
