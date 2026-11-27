import { Link } from "react-router-dom";
import MatchStatusBadge from "@/components/match/MatchStatusBadge";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import {
  DECIDED_BY_NOTE,
  FINISHED_MATCH_STATUSES,
  MATCH_PERIOD_LABEL,
  MATCH_STATUS,
} from "@/constants/match.constants";
import useMatchClock from "@/hooks/useMatchClock";
import { cn } from "@/utils/cn";
import { sideLabel } from "@/utils/match";

const TeamBlock = ({ match, side, linkTeams }) => {
  const team = match[`${side}Team`];
  const isWinner = team && team.id === match.winnerTeamId;
  const badge = (
    <span
      className={cn(
        "flex size-14 items-center justify-center rounded-2xl font-brand text-base font-extrabold sm:size-20 sm:text-xl",
        team ? "bg-brand-700 text-white" : "bg-surface-muted text-fg-muted",
        isWinner && "ring-4 ring-accent-400",
      )}
    >
      {team?.shortName ?? "?"}
    </span>
  );
  const name = (
    <span
      className={cn(
        "line-clamp-2 text-center text-sm font-semibold sm:text-base",
        team ? "text-fg" : "text-fg-muted italic",
      )}
    >
      {sideLabel(match, side)}
    </span>
  );
  const className = "flex w-24 flex-col items-center gap-2 sm:w-40";
  return team && linkTeams ? (
    <Link
      to={buildPath(ROUTES.TEAM, { teamId: team.id })}
      className={cn(className, "hover:opacity-90")}
    >
      {badge}
      {name}
    </Link>
  ) : (
    <div className={className}>
      {badge}
      {name}
    </div>
  );
};

// Teams, score and the running clock; shared by the public match page and the scorer console
const LiveScoreboard = ({ match, linkTeams = true }) => {
  const clock = useMatchClock(match.status === MATCH_STATUS.LIVE ? match : null);
  const showScore =
    match.status === MATCH_STATUS.LIVE || FINISHED_MATCH_STATUSES.includes(match.status);
  const isLive = match.status === MATCH_STATUS.LIVE;

  return (
    <div className="flex w-full items-start justify-center gap-2 sm:gap-8">
      <TeamBlock match={match} side="home" linkTeams={linkTeams} />
      <div className="flex min-w-24 flex-col items-center gap-1.5 pt-2 sm:pt-5">
        {showScore ? (
          <span
            className="font-brand text-4xl font-extrabold text-fg tabular-nums sm:text-5xl"
            aria-label={`Score ${match.homeScore ?? 0} to ${match.awayScore ?? 0}`}
          >
            {match.homeScore ?? 0} – {match.awayScore ?? 0}
          </span>
        ) : (
          <span className="font-brand text-2xl font-bold text-fg-muted">vs</span>
        )}
        {isLive ? (
          <>
            <span className="font-brand text-lg font-bold text-live tabular-nums" aria-live="off">
              {clock.isRunning ? clock.display : MATCH_PERIOD_LABEL[match.period]}
            </span>
            <MatchStatusBadge status={match.status} />
            {clock.isRunning && (
              <span className="text-xs text-fg-muted">{MATCH_PERIOD_LABEL[match.period]}</span>
            )}
          </>
        ) : (
          <>
            <MatchStatusBadge status={match.status} />
            {DECIDED_BY_NOTE[match.decidedBy] && match.status === MATCH_STATUS.COMPLETED && (
              <span className="text-xs text-fg-muted">{DECIDED_BY_NOTE[match.decidedBy]}</span>
            )}
          </>
        )}
      </div>
      <TeamBlock match={match} side="away" linkTeams={linkTeams} />
    </div>
  );
};

export default LiveScoreboard;
