import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants/routes.constants";

const UnauthorizedPage = () => (
  <EmptyState
    icon={ShieldAlert}
    title="Access denied"
    description="You don't have permission to open this page."
    action={
      <Link to={ROUTES.HOME} className="font-semibold text-link hover:underline">
        Go to home
      </Link>
    }
    className="min-h-[60vh]"
  />
);

export default UnauthorizedPage;
