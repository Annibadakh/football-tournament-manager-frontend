import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarClock, MapPin, Swords } from "lucide-react";
import MatchStatusBadge from "@/components/match/MatchStatusBadge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { FINISHED_MATCH_STATUSES, MATCH_STATUS } from "@/constants/match.constants";
import { getMatch } from "@/services/match.service";
import { cn } from "@/utils/cn";
import { formatKickoff, sideLabel } from "@/utils/match";

const TeamSide = ({ match, side }) => {
  const team = match[`${side}Team`];
  const content = (
    <>
      <span
        className={cn(
          "flex size-16 items-center justify-center rounded-2xl font-brand text-lg font-extrabold sm:size-20 sm:text-xl",
          team ? "bg-brand-700 text-white" : "bg-surface-muted text-fg-muted",
        )}
      >
        {team?.shortName ?? "?"}
      </span>
      <span
        className={cn(
          "text-center text-sm font-semibold sm:text-base",
          team ? "text-fg" : "text-fg-muted italic",
        )}
      >
        {sideLabel(match, side)}
      </span>
    </>
  );
  return team ? (
    <Link
      to={buildPath(ROUTES.TEAM, { teamId: team.id })}
      className="flex w-28 flex-col items-center gap-2 hover:opacity-90 sm:w-40"
    >
      {content}
    </Link>
  ) : (
    <div className="flex w-28 flex-col items-center gap-2 sm:w-40">{content}</div>
  );
};

// Public match page: teams, score or kick-off, round, ground (live timeline arrives in 5B)
const MatchPage = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(undefined);

  useEffect(() => {
    getMatch(matchId, { errorToast: false }).then((res) => setMatch(res.ok ? res.data : null));
  }, [matchId]);

  if (match === undefined) return <PageLoader label="Loading match..." />;
  if (!match)
    return (
      <EmptyState
        icon={Swords}
        title="Match not found"
        description="It may have been removed."
        className="min-h-[60vh]"
      />
    );

  const showScore =
    match.status === MATCH_STATUS.LIVE || FINISHED_MATCH_STATUSES.includes(match.status);
  const stageLine = [
    match.roundName,
    match.group && `Group ${match.group.name}`,
    `Match ${match.matchNumber}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <Link
        to={buildPath(ROUTES.TOURNAMENT, { tournamentId: match.tournament.slug })}
        className="text-sm font-semibold text-link hover:underline"
      >
        {match.tournament.name}
      </Link>
      <Card>
        <div className="flex flex-col items-center gap-4 py-2">
          <p className="text-xs font-semibold tracking-wide text-fg-muted uppercase">{stageLine}</p>
          <div className="flex w-full items-start justify-center gap-3 sm:gap-8">
            <TeamSide match={match} side="home" />
            <div className="flex min-w-20 flex-col items-center gap-2 pt-4 sm:pt-6">
              {showScore ? (
                <span className="font-brand text-4xl font-extrabold text-fg tabular-nums sm:text-5xl">
                  {match.homeScore ?? 0} – {match.awayScore ?? 0}
                </span>
              ) : (
                <span className="font-brand text-2xl font-bold text-fg-muted">vs</span>
              )}
              <MatchStatusBadge status={match.status} />
            </div>
            <TeamSide match={match} side="away" />
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-fg-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4" aria-hidden="true" />
              {formatKickoff(match.scheduledAt)} {match.scheduledAt && "IST"}
            </span>
            {match.ground && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden="true" />
                {match.ground.name}
              </span>
            )}
          </div>
          {match.nextMatch && (
            <p className="text-xs text-fg-muted">
              Winner plays in match M{match.nextMatch.matchNumber}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MatchPage;
