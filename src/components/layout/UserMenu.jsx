import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { ROUTES } from "@/constants/routes.constants";
import { ACCOUNT_ROLE_LABEL } from "@/constants/user.constants";
import { endSession } from "@/services/session";
import { selectCurrentUser } from "@/store/slices/authSlice";

const MENU_LINKS = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", Icon: LayoutDashboard },
  { to: ROUTES.PROFILE, label: "My profile", Icon: UserRound },
  { to: ROUTES.SECURITY, label: "Security", Icon: ShieldCheck },
];

const itemClass =
  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-fg hover:bg-surface-muted";

const UserMenu = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => event.key === "Escape" && setIsOpen(false);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await endSession();
    navigate(ROUTES.HOME, { replace: true });
  };

  if (!user) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account menu"
        className="rounded-full"
      >
        <Avatar src={user.photoUrl} name={user.fullName} size="sm" />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-line bg-surface p-2 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate font-semibold text-fg">{user.fullName}</p>
            <p className="truncate text-xs text-fg-muted">
              {ACCOUNT_ROLE_LABEL[user.accountRole]} · {user.email}
            </p>
          </div>
          <div className="my-1 border-t border-line" />
          {MENU_LINKS.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              className={itemClass}
              onClick={() => setIsOpen(false)}
            >
              <Icon className="size-4 text-fg-muted" aria-hidden="true" />
              {label}
            </Link>
          ))}
          <div className="my-1 border-t border-line" />
          <button type="button" role="menuitem" className={itemClass} onClick={handleLogout}>
            <LogOut className="size-4 text-fg-muted" aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
