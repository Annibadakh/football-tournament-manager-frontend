import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Trophy } from "lucide-react";
import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import UserMenu from "@/components/layout/UserMenu";
import { ROUTES } from "@/constants/routes.constants";
import { selectIsAuthenticated, selectIsSessionReady } from "@/store/slices/authSlice";

const linkButtonClass =
  "inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition-colors";

const PublicHeader = () => {
  const isSessionReady = useSelector(selectIsSessionReady);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Logo />
          {/* Icon-only on phones so the header never wraps */}
          <NavLink
            to={ROUTES.TOURNAMENTS}
            aria-label="Tournaments"
            className={({ isActive }) =>
              `inline-flex items-center gap-1.5 rounded-lg p-2 text-sm font-semibold sm:p-0 ${isActive ? "text-link" : "text-fg-muted hover:text-fg"}`
            }
          >
            <Trophy className="size-5 sm:hidden" aria-hidden="true" />
            <span className="hidden sm:inline">Tournaments</span>
          </NavLink>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Phones follow the system theme here; the toggle is also in the dashboard and auth pages */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          {isSessionReady && isAuthenticated && <UserMenu />}
          {isSessionReady && !isAuthenticated && (
            <>
              <Link
                to={ROUTES.LOGIN}
                className={`${linkButtonClass} text-fg hover:bg-surface-muted`}
              >
                Log in
              </Link>
              <Link
                to={ROUTES.SIGNUP}
                className={`${linkButtonClass} bg-brand-600 text-white hover:bg-brand-700`}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
