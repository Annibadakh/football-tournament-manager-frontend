import Badge from "@/components/ui/Badge";
import { TEAM_STATUS_BADGE, TEAM_STATUS_LABEL } from "@/constants/team.constants";

const TeamStatusBadge = ({ status, size = "sm" }) => (
  <Badge variant={TEAM_STATUS_BADGE[status]} size={size}>
    {TEAM_STATUS_LABEL[status]}
  </Badge>
);

export default TeamStatusBadge;
