import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import MatchStatusBadge from "@/components/match/MatchStatusBadge";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { DECIDED_BY, FINISHED_MATCH_STATUSES, MATCH_STATUS } from "@/constants/match.constants";

const DECIDED_SHORT = { [DECIDED_BY.PENALTIES]: "pens", [DECIDED_BY.EXTRA_TIME]: "aet" };
import { cn } from "@/utils/cn";
import { formatKickoff, sideLabel } from "@/utils/match";

const hasScore = (match) =>
  match.status === MATCH_STATUS.LIVE || FINISHED_MATCH_STATUSES.includes(match.status);

const Side = ({ match, side, align }) => {
  const isPlaceholder = !match[`${side}Team`];
  const isWinner = match.winnerTeamId && match[`${side}Team`]?.id === match.winnerTeamId;
  return (
    <span
      className={cn(
        "min-w-0 flex-1 truncate text-sm",
        align === "right" && "text-right",
        isPlaceholder ? "text-fg-muted italic" : "font-semibold text-fg",
        isWinner && "text-brand-700 dark:text-brand-300",
      )}
    >
      {sideLabel(match, side)}
    </span>
  );
};

// One fixture: "M3 · Team A 2–1 Team B", kick-off, ground; actions slot for organizers
const MatchRow = ({ match, actions = null, showGroup = true }) => (
  <div className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-center sm:gap-3">
    <Link
      to={buildPath(ROUTES.MATCH, { matchId: match.id })}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg hover:bg-surface-muted/60 sm:px-2 sm:py-1"
    >
      <span className="w-9 shrink-0 text-xs font-semibold text-fg-muted">M{match.matchNumber}</span>
      <Side match={match} side="home" align="right" />
      <span
        className={cn(
          "shrink-0 rounded-md px-2 py-0.5 text-center font-brand text-sm font-bold tabular-nums",
          hasScore(match)
            ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
            : "text-fg-muted",
        )}
      >
        {hasScore(match) ? `${match.homeScore ?? 0} – ${match.awayScore ?? 0}` : "v"}
      </span>
      {DECIDED_SHORT[match.decidedBy] && match.status === MATCH_STATUS.COMPLETED && (
        <span className="shrink-0 text-[10px] font-semibold text-fg-muted uppercase">
          {DECIDED_SHORT[match.decidedBy]}
        </span>
      )}
      <Side match={match} side="away" />
    </Link>
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-11 text-xs text-fg-muted sm:w-64 sm:shrink-0 sm:pl-0">
      <span>{formatKickoff(match.scheduledAt)}</span>
      {match.ground && (
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3" aria-hidden="true" />
          {match.ground.name}
        </span>
      )}
      {showGroup && match.group && <span>Group {match.group.name}</span>}
      {match.status !== MATCH_STATUS.SCHEDULED && <MatchStatusBadge status={match.status} />}
    </div>
    {actions}
  </div>
);

export default MatchRow;
