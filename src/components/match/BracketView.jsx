import { Link } from "react-router-dom";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { FINISHED_MATCH_STATUSES, MATCH_STATUS } from "@/constants/match.constants";
import { cn } from "@/utils/cn";
import { formatKickoff, sideLabel } from "@/utils/match";

const showsScore = (match) =>
  match.status === MATCH_STATUS.LIVE || FINISHED_MATCH_STATUSES.includes(match.status);

const BracketSide = ({ match, side }) => {
  const team = match[`${side}Team`];
  const isWinner = team && team.id === match.winnerTeamId;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-1.5 text-sm",
        isWinner && "bg-brand-50 font-semibold dark:bg-brand-900/40",
      )}
    >
      <span className={cn("truncate", team ? "text-fg" : "text-fg-muted italic")}>
        {sideLabel(match, side)}
      </span>
      {showsScore(match) && (
        <span className="font-brand font-bold tabular-nums">{match[`${side}Score`] ?? 0}</span>
      )}
    </div>
  );
};

const BracketMatch = ({ match }) => (
  <Link
    to={buildPath(ROUTES.MATCH, { matchId: match.id })}
    className="block w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-sm hover:border-brand-400"
  >
    <div className="flex justify-between border-b border-line px-3 py-1 text-[11px] text-fg-muted">
      <span>M{match.matchNumber}</span>
      <span>{formatKickoff(match.scheduledAt)}</span>
    </div>
    <BracketSide match={match} side="home" />
    <div className="border-t border-line" />
    <BracketSide match={match} side="away" />
  </Link>
);

// Rounds as columns; each column spreads its matches so pairs line up with the next round
const BracketView = ({ bracket }) => (
  <div className="-mx-4 overflow-x-auto px-4 pb-2">
    <div className="flex min-w-max gap-6">
      {bracket.rounds.map((round) => (
        <div key={round.roundNumber} className="flex w-56 flex-col">
          <h3 className="mb-3 text-xs font-bold tracking-wide text-fg-muted uppercase">
            {round.name}
          </h3>
          <div className="flex flex-1 flex-col justify-around gap-4">
            {round.matches.map((match) => (
              <BracketMatch key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
      {bracket.thirdPlace && (
        <div className="flex w-56 flex-col">
          <h3 className="mb-3 text-xs font-bold tracking-wide text-fg-muted uppercase">
            Third place
          </h3>
          <div className="flex flex-1 flex-col justify-end">
            <BracketMatch match={bracket.thirdPlace} />
          </div>
        </div>
      )}
    </div>
  </div>
);

export default BracketView;
