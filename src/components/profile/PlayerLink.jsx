import { Link } from "react-router-dom";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { cn } from "@/utils/cn";

// Player name linking to the public profile (guests have none, so they stay plain text)
const PlayerLink = ({ player, className = "", isVerified, children }) => {
  if (!player) return null;
  const hasProfile = isVerified ?? player.isVerified ?? true;
  const label = children ?? player.fullName;
  if (!hasProfile) return <span className={className}>{label}</span>;
  return (
    <Link
      to={buildPath(ROUTES.PLAYER, { playerId: player.id })}
      className={cn("hover:underline", className)}
    >
      {label}
    </Link>
  );
};

export default PlayerLink;
