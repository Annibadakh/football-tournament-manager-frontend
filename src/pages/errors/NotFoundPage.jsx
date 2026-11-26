import { Link } from "react-router-dom";
import { MapPinOff } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants/routes.constants";

const NotFoundPage = () => (
  <EmptyState
    icon={MapPinOff}
    title="Page not found"
    description="The page you are looking for doesn't exist or has moved."
    action={
      <Link to={ROUTES.HOME} className="font-semibold text-link hover:underline">
        Go to home
      </Link>
    }
    className="min-h-[60vh]"
  />
);

export default NotFoundPage;
