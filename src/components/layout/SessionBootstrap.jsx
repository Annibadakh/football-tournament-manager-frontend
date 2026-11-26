import { useEffect } from "react";
import { refreshAccessToken } from "@/services/session";

// Restores the session from the refresh cookie once on app load (silently)
let hasStarted = false;

const SessionBootstrap = ({ children }) => {
  useEffect(() => {
    // StrictMode mounts twice in dev; a second refresh would rotate the token again
    if (hasStarted) return;
    hasStarted = true;
    refreshAccessToken();
  }, []);

  return children;
};

export default SessionBootstrap;
