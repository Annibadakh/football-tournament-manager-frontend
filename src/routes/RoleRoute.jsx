import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "@/constants/routes.constants";
import { selectCurrentUser, selectIsAuthenticated } from "@/store/slices/authSlice";

// Guards a route group: must be logged in, and (optionally) have one of allowedRoles
const RoleRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }
  if (allowedRoles && !allowedRoles.includes(user.accountRole)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }
  return <Outlet />;
};

export default RoleRoute;
