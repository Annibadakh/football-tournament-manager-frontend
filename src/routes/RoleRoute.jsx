import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PageLoader from "@/components/ui/PageLoader";
import { ROUTES } from "@/constants/routes.constants";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsSessionReady,
  selectIsVerified,
} from "@/store/slices/authSlice";

/**
 * Guards a route group: must be logged in, verified (unless requireVerified=false),
 * and have one of allowedRoles when given. UX only; the API enforces permissions.
 */
const RoleRoute = ({ allowedRoles, requireVerified = true }) => {
  const location = useLocation();
  const isSessionReady = useSelector(selectIsSessionReady);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isVerified = useSelector(selectIsVerified);
  const user = useSelector(selectCurrentUser);

  if (!isSessionReady) return <PageLoader label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  if (requireVerified && !isVerified) return <Navigate to={ROUTES.VERIFY_ACCOUNT} replace />;
  if (allowedRoles && !allowedRoles.includes(user.accountRole)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }
  return <Outlet />;
};

export default RoleRoute;
