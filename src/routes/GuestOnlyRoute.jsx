import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import PageLoader from "@/components/ui/PageLoader";
import { ROUTES } from "@/constants/routes.constants";
import { selectIsAuthenticated, selectIsSessionReady } from "@/store/slices/authSlice";

// Login/sign-up pages: already logged-in users go straight to the dashboard
const GuestOnlyRoute = () => {
  const isSessionReady = useSelector(selectIsSessionReady);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isSessionReady) return <PageLoader label="Checking your session..." />;
  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />;
};

export default GuestOnlyRoute;
