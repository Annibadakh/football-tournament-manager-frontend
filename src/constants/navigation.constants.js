import {
  BookOpenCheck,
  LayoutDashboard,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { ACCOUNT_ROLE } from "@/constants/user.constants";
import { ROUTES } from "@/constants/routes.constants";

// Dashboard sidebar; items without roles are visible to every logged-in user
export const DASHBOARD_NAV_ITEMS = Object.freeze([
  { to: ROUTES.DASHBOARD, label: "Overview", icon: LayoutDashboard },
  {
    to: ROUTES.MANAGE_TOURNAMENTS,
    label: "Tournaments",
    icon: Trophy,
    roles: [ACCOUNT_ROLE.SUPERADMIN, ACCOUNT_ROLE.ADMIN, ACCOUNT_ROLE.ORGANIZER],
  },
  {
    to: ROUTES.USERS,
    label: "Users",
    icon: Users,
    roles: [ACCOUNT_ROLE.SUPERADMIN, ACCOUNT_ROLE.ADMIN],
  },
  {
    to: ROUTES.RULE_BOOK,
    label: "Rule book",
    icon: BookOpenCheck,
    roles: [ACCOUNT_ROLE.SUPERADMIN, ACCOUNT_ROLE.ADMIN],
  },
  { to: ROUTES.PROFILE, label: "My profile", icon: UserRound },
  { to: ROUTES.SECURITY, label: "Security", icon: ShieldCheck },
]);
