import { Toaster } from "sonner";
import useTheme from "@/hooks/useTheme";

// Single toast host for the app; request() triggers toasts from anywhere
const AppToaster = () => {
  const { resolvedTheme } = useTheme();
  return <Toaster theme={resolvedTheme} position="top-right" richColors closeButton />;
};

export default AppToaster;
