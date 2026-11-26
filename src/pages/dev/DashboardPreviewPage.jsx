import { Calendar, LayoutDashboard, Shield, Trophy, Users } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";

// Sample links only, to preview the dashboard shell before auth exists
const PREVIEW_NAV_ITEMS = [
  { to: "/dev/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dev/dashboard/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/dev/dashboard/teams", label: "Teams", icon: Users },
  { to: "/dev/dashboard/matches", label: "Matches", icon: Calendar },
  { to: "/dev/dashboard/admin", label: "Admin only", icon: Shield, roles: ["admin"] },
];

const DashboardPreviewPage = () => <DashboardLayout navItems={PREVIEW_NAV_ITEMS} />;

export default DashboardPreviewPage;
