import { useSelector } from "react-redux";
import { selectCurrentUser, selectIsSessionReady } from "@/store/slices/authSlice";

// Null while the session is restoring, then the viewer's id (or "guest"); use as a fetch dependency
const useViewerKey = () => {
  const isSessionReady = useSelector(selectIsSessionReady);
  const user = useSelector(selectCurrentUser);
  if (!isSessionReady) return null;
  return user?.id ?? "guest";
};

export default useViewerKey;
