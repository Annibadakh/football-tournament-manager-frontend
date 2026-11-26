export const ROUTES = Object.freeze({
  HOME: "/",
  TOURNAMENTS: "/tournaments",
  TOURNAMENT: "/tournaments/:tournamentId",
  TEAM: "/teams/:teamId",
  LOGIN: "/login",
  SIGNUP: "/signup",
  VERIFY_ACCOUNT: "/verify",
  FORGOT_PASSWORD: "/forgot-password",
  INVITE: "/invites/:token",
  DASHBOARD: "/dashboard",
  PROFILE: "/dashboard/profile",
  SECURITY: "/dashboard/security",
  USERS: "/dashboard/users",
  MANAGE_TOURNAMENTS: "/dashboard/tournaments",
  MANAGE_TOURNAMENT: "/dashboard/tournaments/:tournamentId",
  RULE_BOOK: "/dashboard/rules",
  UNAUTHORIZED: "/unauthorized",
  DEV_COMPONENTS: "/dev/components",
  DEV_DASHBOARD: "/dev/dashboard",
});

// Fills route params, e.g. buildPath(ROUTES.TOURNAMENT, { tournamentId: slug })
export const buildPath = (route, params) =>
  Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(value)),
    route,
  );
