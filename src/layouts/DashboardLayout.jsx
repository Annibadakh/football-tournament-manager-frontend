import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import DashboardHeader from "@/components/layout/DashboardHeader";
import UserMenu from "@/components/layout/UserMenu";
import { DASHBOARD_NAV_ITEMS } from "@/constants/navigation.constants";
import Sidebar from "@/components/layout/Sidebar";
import { selectCurrentUser } from "@/store/slices/authSlice";

// navItems is passed in so each phase can register its own dashboard links
const DashboardLayout = ({ navItems = DASHBOARD_NAV_ITEMS }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = useSelector(selectCurrentUser);

  return (
    <div className="flex min-h-dvh flex-col">
      <DashboardHeader
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        rightSlot={<UserMenu />}
      />
      <div className="flex flex-1">
        <Sidebar
          items={navItems}
          userRole={user?.accountRole}
          isOpen={isSidebarOpen}
          onNavigate={() => setIsSidebarOpen(false)}
        />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden"
            aria-hidden="true"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
