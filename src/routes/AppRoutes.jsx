import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import PageLoader from "@/components/ui/PageLoader";
import { ROUTES } from "@/constants/routes.constants";
import DashboardLayout from "@/layouts/DashboardLayout";
import PublicLayout from "@/layouts/PublicLayout";
import DashboardHomePage from "@/pages/dashboard/home/DashboardHomePage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import UnauthorizedPage from "@/pages/errors/UnauthorizedPage";
import HomePage from "@/pages/public/home/HomePage";
import RoleRoute from "@/routes/RoleRoute";

// import.meta.env.DEV is read directly (not via config/env) so Vite can drop dev pages from production builds
const ComponentShowcasePage = import.meta.env.DEV
  ? lazy(() => import("@/pages/dev/ComponentShowcasePage"))
  : null;
const DashboardPreviewPage = import.meta.env.DEV
  ? lazy(() => import("@/pages/dev/DashboardPreviewPage"))
  : null;

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        {ComponentShowcasePage && (
          <Route path={ROUTES.DEV_COMPONENTS} element={<ComponentShowcasePage />} />
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<RoleRoute />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
        </Route>
      </Route>

      {DashboardPreviewPage && (
        <Route path={`${ROUTES.DEV_DASHBOARD}/*`} element={<DashboardPreviewPage />}>
          <Route path="*" element={<DashboardHomePage />} />
        </Route>
      )}
    </Routes>
  </Suspense>
);

export default AppRoutes;
