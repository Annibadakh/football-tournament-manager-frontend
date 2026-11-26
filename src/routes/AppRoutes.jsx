import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";
import { ROUTES } from "@/constants/routes.constants";
import { ACCOUNT_ROLE } from "@/constants/user.constants";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import PublicLayout from "@/layouts/PublicLayout";
import AcceptInvitePage from "@/pages/auth/AcceptInvitePage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import VerifyAccountPage from "@/pages/auth/VerifyAccountPage";
import DashboardHomePage from "@/pages/dashboard/home/DashboardHomePage";
import ProfilePage from "@/pages/dashboard/profile/ProfilePage";
import SecurityPage from "@/pages/dashboard/security/SecurityPage";
import UsersPage from "@/pages/dashboard/users/UsersPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import UnauthorizedPage from "@/pages/errors/UnauthorizedPage";
import HomePage from "@/pages/public/home/HomePage";
import GuestOnlyRoute from "@/routes/GuestOnlyRoute";
import RoleRoute from "@/routes/RoleRoute";

// import.meta.env.DEV is read directly (not via config/env) so Vite can drop dev pages from production builds
const ComponentShowcasePage = import.meta.env.DEV
  ? lazy(() => import("@/pages/dev/ComponentShowcasePage"))
  : null;
const DashboardPreviewPage = import.meta.env.DEV
  ? lazy(() => import("@/pages/dev/DashboardPreviewPage"))
  : null;

const STAFF_ADMIN_ROLES = [ACCOUNT_ROLE.SUPERADMIN, ACCOUNT_ROLE.ADMIN];

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

      <Route element={<AuthLayout />}>
        <Route element={<GuestOnlyRoute />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.INVITE} element={<AcceptInvitePage />} />
        </Route>
        <Route element={<RoleRoute requireVerified={false} />}>
          <Route path={ROUTES.VERIFY_ACCOUNT} element={<VerifyAccountPage />} />
        </Route>
      </Route>

      <Route element={<RoleRoute />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.SECURITY} element={<SecurityPage />} />
          <Route element={<RoleRoute allowedRoles={STAFF_ADMIN_ROLES} />}>
            <Route path={ROUTES.USERS} element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      {DashboardPreviewPage && (
        <Route path={`${ROUTES.DEV_DASHBOARD}/*`} element={<DashboardPreviewPage />}>
          <Route
            path="*"
            element={
              <EmptyState title="Dashboard preview" description="Dev-only layout preview." />
            }
          />
        </Route>
      )}
    </Routes>
  </Suspense>
);

export default AppRoutes;
