import Badge from "@/components/ui/Badge";
import { MATCH_STATUS_BADGE, MATCH_STATUS_LABEL } from "@/constants/match.constants";

const MatchStatusBadge = ({ status, size = "sm" }) => (
  <Badge size={size} variant={MATCH_STATUS_BADGE[status]}>
    {MATCH_STATUS_LABEL[status]}
  </Badge>
);

export default MatchStatusBadge;
