import Badge from "@/components/ui/Badge";
import { TOURNAMENT_STATUS_BADGE, TOURNAMENT_STATUS_LABEL } from "@/constants/tournament.constants";

const TournamentStatusBadge = ({ status, size = "md" }) => (
  <Badge variant={TOURNAMENT_STATUS_BADGE[status]} size={size}>
    {TOURNAMENT_STATUS_LABEL[status]}
  </Badge>
);

export default TournamentStatusBadge;
