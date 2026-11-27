import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Timer } from "lucide-react";
import Card from "@/components/ui/Card";
import MatchStatusBadge from "@/components/match/MatchStatusBadge";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { MATCH_STATUS } from "@/constants/match.constants";
import { listMyScoringMatches } from "@/services/match.service";
import { formatKickoff, sideLabel } from "@/utils/match";

const VISIBLE = 6;

// Live and upcoming matches the user can score (as a scorer or the organizer)
const ScoringMatchesCard = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    let isCurrent = true;
    listMyScoringMatches({ errorToast: false }).then((res) => {
      if (isCurrent && res.ok) setMatches(res.data);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  if (!matches.length) return null;
  return (
    <Card title="Matches to score" subtitle="Live first, then the next kick-offs">
      <ul className="flex flex-col divide-y divide-line">
        {matches.slice(0, VISIBLE).map((match) => (
          <li key={match.id}>
            <Link
              to={buildPath(ROUTES.MATCH_CONSOLE, { matchId: match.id })}
              className="flex items-center gap-3 py-2.5 hover:bg-surface-muted/60"
            >
              <Timer className="size-5 shrink-0 text-brand-600" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-fg">
                  {sideLabel(match, "home")} v {sideLabel(match, "away")}
                </span>
                <span className="block truncate text-xs text-fg-muted">
                  {match.tournament.name} · M{match.matchNumber} ·{" "}
                  {formatKickoff(match.scheduledAt)}
                </span>
              </span>
              {match.status === MATCH_STATUS.LIVE && <MatchStatusBadge status={match.status} />}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default ScoringMatchesCard;
