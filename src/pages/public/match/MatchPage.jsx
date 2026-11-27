import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarClock, MapPin, Medal, Radio, Swords, Timer } from "lucide-react";
import EventTimeline from "@/components/match/EventTimeline";
import LiveScoreboard from "@/components/match/LiveScoreboard";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { MATCH_STATUS } from "@/constants/match.constants";
import useLiveMatch from "@/hooks/useLiveMatch";
import useViewerKey from "@/hooks/useViewerKey";
import { getMatch } from "@/services/match.service";
import { formatKickoff } from "@/utils/match";

const MatchView = ({ initial }) => {
  // Refreshes every 10 s while the match is live
  const [match] = useLiveMatch(initial.id, initial);
  const isLive = match.status === MATCH_STATUS.LIVE;
  const stageLine = [
    match.roundName,
    match.group && `Group ${match.group.name}`,
    `Match ${match.matchNumber}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to={buildPath(ROUTES.TOURNAMENT, { tournamentId: match.tournament.slug })}
          className="text-sm font-semibold text-link hover:underline"
        >
          {match.tournament.name}
        </Link>
        {match.canScore && (
          <Link
            to={buildPath(ROUTES.MATCH_CONSOLE, { matchId: match.id })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-800"
          >
            <Timer className="size-4" aria-hidden="true" /> Open scorer console
          </Link>
        )}
      </div>
      <Card>
        <div className="flex flex-col items-center gap-4 py-2">
          <p className="text-xs font-semibold tracking-wide text-fg-muted uppercase">{stageLine}</p>
          <LiveScoreboard match={match} />
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
          {isLive && (
            <p className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
              <Radio className="size-3.5 text-live" aria-hidden="true" /> Live: updates every few
              seconds
            </p>
          )}
          {match.potm && (
            <p className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-sm font-semibold text-accent-800 dark:bg-accent-900 dark:text-accent-100">
              <Medal className="size-4" aria-hidden="true" /> Player of the Match:{" "}
              {match.potm.fullName}
            </p>
          )}
          {match.nextMatch && match.status === MATCH_STATUS.SCHEDULED && (
            <p className="text-xs text-fg-muted">
              Winner plays in match M{match.nextMatch.matchNumber}
            </p>
          )}
        </div>
      </Card>
      {match.status !== MATCH_STATUS.SCHEDULED && (
        <Card title="Timeline">
          <EventTimeline events={match.events ?? []} homeTeamId={match.homeTeam?.id} />
        </Card>
      )}
    </div>
  );
};

// Public match page: score, live clock and timeline
const MatchPage = () => {
  const { matchId } = useParams();
  const viewerKey = useViewerKey();
  const [match, setMatch] = useState(undefined);

  // The scorer button depends on who is viewing, so wait for the session
  useEffect(() => {
    if (!viewerKey) return undefined;
    let isCurrent = true;
    getMatch(matchId, { errorToast: false }).then((res) => {
      if (isCurrent) setMatch(res.ok ? res.data : null);
    });
    return () => {
      isCurrent = false;
    };
  }, [matchId, viewerKey]);

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
  return <MatchView key={match.id} initial={match} />;
};

export default MatchPage;
