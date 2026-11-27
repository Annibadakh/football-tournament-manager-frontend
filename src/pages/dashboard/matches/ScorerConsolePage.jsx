import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, ExternalLink, Flag, RotateCcw, Timer, Trophy, XCircle } from "lucide-react";
import EventTimeline from "@/components/match/EventTimeline";
import LiveScoreboard from "@/components/match/LiveScoreboard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import {
  CARD_NOTICE_REASON,
  MATCH_EVENT_TYPE,
  MATCH_PERIOD,
  MATCH_STAGE,
  MATCH_STATUS,
  NEXT_PERIOD,
  PERIOD_ACTION_LABEL,
} from "@/constants/match.constants";
import useLiveMatch from "@/hooks/useLiveMatch";
import useMatchClock from "@/hooks/useMatchClock";
import * as matchService from "@/services/match.service";
import AwardMatchModal from "@/pages/dashboard/matches/AwardMatchModal";
import EventModal from "@/pages/dashboard/matches/EventModal";
import ResultModal from "@/pages/dashboard/matches/ResultModal";

const EVENT_BUTTONS = [
  { type: MATCH_EVENT_TYPE.GOAL, label: "Goal" },
  { type: MATCH_EVENT_TYPE.OWN_GOAL, label: "Own goal" },
  { type: MATCH_EVENT_TYPE.YELLOW_CARD, label: "Yellow" },
  { type: MATCH_EVENT_TYPE.RED_CARD, label: "Red" },
];

const LOG_TEXT = {
  period: (payload) => `Clock → period ${payload.period}`,
  event_added: (payload) => `Added: ${payload.player} (${payload.team}) ${payload.minute}'`,
  event_undone: () => "Undid the last event",
  result_declared: (payload) =>
    `Result declared ${payload.score}${payload.winner ? ` · ${payload.winner} won` : ""}`,
  walkover: (payload) => `${payload.type} awarded to ${payload.winner}`,
  cancelled: () => "Match cancelled",
};

const noticeText = (notice) =>
  notice.reason === CARD_NOTICE_REASON.RED_CARD
    ? `red card in M${notice.sourceMatch?.matchNumber}`
    : `${notice.yellowCount} yellow cards`;

// Mobile-first console for the organizer and the tournament's scorers
const ScorerConsole = ({ initial, onReload }) => {
  const { squads, canManage } = initial;
  const [logs, setLogs] = useState(initial.logs);
  const [match, replaceMatch] = useLiveMatch(initial.match.id, initial.match);
  const clock = useMatchClock(match.status === MATCH_STATUS.LIVE ? match : null);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  // Applies a scorer action's fresh state and reloads the match log quietly
  const applyAction = (state) => {
    replaceMatch(state);
    matchService.getConsole(initial.match.id, { errorToast: false }).then((res) => {
      if (res.ok) setLogs(res.data.logs);
    });
  };

  const isLive = match.status === MATCH_STATUS.LIVE;
  const isOver = [
    MATCH_STATUS.COMPLETED,
    MATCH_STATUS.WALKOVER,
    MATCH_STATUS.FORFEIT,
    MATCH_STATUS.CANCELLED,
  ].includes(match.status);
  const isKnockout = match.stage === MATCH_STAGE.KNOCKOUT;
  const nextPeriod = NEXT_PERIOD[match.period];
  const canDeclare =
    isLive && [MATCH_PERIOD.FULL_TIME, MATCH_PERIOD.FINISHED].includes(match.period);
  const showNextPeriod =
    !isOver && nextPeriod !== undefined && (match.period !== MATCH_PERIOD.FULL_TIME || isKnockout);
  const flagged = [...squads.home, ...squads.away].filter((player) => player.notices.length);

  const runPeriod = async () => {
    setIsBusy(true);
    const res = await matchService.changePeriod(match.id, nextPeriod);
    setIsBusy(false);
    setConfirm(null);
    if (res.ok) applyAction(res.data);
  };

  const undo = async () => {
    setIsBusy(true);
    const res = await matchService.undoLastEvent(match.id);
    setIsBusy(false);
    setConfirm(null);
    if (res.ok) applyAction(res.data);
  };

  const cancel = async () => {
    setIsBusy(true);
    const res = await matchService.cancelMatch(match.id);
    setIsBusy(false);
    setConfirm(null);
    if (res.ok) onReload();
  };

  const confirmations = {
    period: {
      title: `${PERIOD_ACTION_LABEL[nextPeriod]}?`,
      message:
        match.period === MATCH_PERIOD.NOT_STARTED
          ? "The match goes live and the clock starts."
          : "The clock moves to the next period.",
      confirmText: PERIOD_ACTION_LABEL[nextPeriod],
      variant: "primary",
      onConfirm: runPeriod,
    },
    undo: {
      title: "Undo the last event?",
      message: "The last goal or card is removed (a second-yellow red removes both cards).",
      confirmText: "Undo",
      onConfirm: undo,
    },
    cancel: {
      title: "Cancel this match?",
      message: "The match is marked cancelled and doesn't count in the table.",
      confirmText: "Cancel match",
      onConfirm: cancel,
    },
  };
  const pending = confirm && confirmations[confirm];

  const teamPanel = (side) => {
    const team = match[`${side}Team`];
    return (
      <div className="flex flex-col gap-2">
        <h3 className="truncate text-center text-sm font-bold text-fg">{team.name}</h3>
        <div className="grid grid-cols-2 gap-2">
          {EVENT_BUTTONS.map((button) => (
            <Button
              key={button.type}
              size="lg"
              variant={button.type === MATCH_EVENT_TYPE.GOAL ? "primary" : "outline"}
              className="w-full px-2"
              aria-label={`${button.label} for ${team.name}`}
              onClick={() => setModal({ type: "event", eventType: button.type, side })}
            >
              {button.type === MATCH_EVENT_TYPE.YELLOW_CARD && (
                <span aria-hidden="true" className="h-4 w-3 rounded-sm bg-amber-400" />
              )}
              {button.type === MATCH_EVENT_TYPE.RED_CARD && (
                <span aria-hidden="true" className="h-4 w-3 rounded-sm bg-red-600" />
              )}
              {button.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to={buildPath(ROUTES.TOURNAMENT, { tournamentId: match.tournament.slug })}
          className="text-sm font-semibold text-link hover:underline"
        >
          {match.tournament.name} · M{match.matchNumber}
        </Link>
        <Link
          to={buildPath(ROUTES.MATCH, { matchId: match.id })}
          className="inline-flex items-center gap-1 text-sm font-semibold text-link hover:underline"
        >
          Public page <ExternalLink className="size-3.5" />
        </Link>
      </div>

      <Card>
        <div className="flex flex-col items-center gap-4 py-1">
          <LiveScoreboard match={match} linkTeams={false} />
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            {showNextPeriod && (
              <Button
                size="lg"
                variant={match.period === MATCH_PERIOD.NOT_STARTED ? "primary" : "outline"}
                loading={isBusy && confirm === "period"}
                onClick={() => setConfirm("period")}
                startIcon={<Timer className="size-5" />}
              >
                {PERIOD_ACTION_LABEL[nextPeriod]}
              </Button>
            )}
            {canDeclare && (
              <Button
                size="lg"
                onClick={() => setModal({ type: "result" })}
                startIcon={<Trophy className="size-5" />}
              >
                Declare result
              </Button>
            )}
          </div>
          {isLive && clock.isRunning && (
            <p className="text-xs text-fg-muted">
              New events get minute {clock.minute}&apos; (editable).
            </p>
          )}
        </div>
      </Card>

      {flagged.length > 0 && (
        <div
          className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          role="status"
        >
          <p className="mb-1 flex items-center gap-2 font-semibold">
            <AlertTriangle className="size-4" aria-hidden="true" /> Card notices (check the
            discipline rules)
          </p>
          <ul className="list-inside list-disc">
            {flagged.map((player) => (
              <li key={player.id}>
                {player.fullName}: {player.notices.map(noticeText).join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isLive && (
        <Card>
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {teamPanel("home")}
            {teamPanel("away")}
          </div>
        </Card>
      )}

      <Card
        title="Timeline"
        actions={
          isLive && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirm("undo")}
              startIcon={<RotateCcw className="size-4" />}
            >
              Undo last
            </Button>
          )
        }
      >
        <EventTimeline events={match.events ?? []} homeTeamId={match.homeTeam?.id} newestFirst />
      </Card>

      {canManage && !isOver && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setModal({ type: "award" })}
            startIcon={<Flag className="size-4" />}
          >
            Walkover / forfeit
          </Button>
          <Button
            variant="ghost"
            className="text-danger"
            onClick={() => setConfirm("cancel")}
            startIcon={<XCircle className="size-4" />}
          >
            Cancel match
          </Button>
        </div>
      )}

      <details className="rounded-xl border border-line bg-surface p-3">
        <summary className="cursor-pointer text-sm font-semibold text-fg">
          Match log ({logs.length})
        </summary>
        <ol className="mt-2 flex flex-col gap-1 text-xs text-fg-muted">
          {logs.map((log) => (
            <li key={log.id}>
              {new Date(log.createdAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })} ·{" "}
              {log.actor?.fullName}: {LOG_TEXT[log.action]?.(log.payload ?? {}) ?? log.action}
            </li>
          ))}
        </ol>
      </details>

      {modal?.type === "event" && (
        <EventModal
          matchId={match.id}
          type={modal.eventType}
          team={match[`${modal.side}Team`]}
          squad={squads[modal.side]}
          minute={clock.minute}
          onClose={() => setModal(null)}
          onSaved={(state, message) => {
            setModal(null);
            applyAction(state);
            toast.success(message);
          }}
        />
      )}
      {modal?.type === "result" && (
        <ResultModal
          match={match}
          squads={squads}
          onClose={() => setModal(null)}
          onDeclared={() => {
            setModal(null);
            onReload();
          }}
        />
      )}
      {modal?.type === "award" && (
        <AwardMatchModal
          match={match}
          onClose={() => setModal(null)}
          onAwarded={() => {
            setModal(null);
            onReload();
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setConfirm(null)}
        loading={isBusy}
        title={pending?.title}
        message={pending?.message}
        confirmText={pending?.confirmText}
        variant={pending?.variant ?? "danger"}
        onConfirm={pending?.onConfirm}
      />
    </div>
  );
};

const ScorerConsolePage = () => {
  const { matchId } = useParams();
  const [data, setData] = useState(undefined);
  const [reloadCount, setReloadCount] = useState(0);
  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  useEffect(() => {
    let isCurrent = true;
    matchService.getConsole(matchId).then((res) => {
      if (isCurrent) setData(res.ok ? { ...res.data, loadedAt: reloadCount } : null);
    });
    return () => {
      isCurrent = false;
    };
  }, [matchId, reloadCount]);

  if (data === undefined) return <PageLoader label="Loading match..." />;
  if (!data)
    return (
      <EmptyState
        title="Can't open this match"
        description="Only the organizer and the tournament's scorers can score matches."
        className="min-h-[50vh]"
      />
    );
  if (!data.match.homeTeam || !data.match.awayTeam)
    return (
      <EmptyState
        title="Teams not decided yet"
        description="This match can be scored once both teams are known."
        className="min-h-[50vh]"
      />
    );
  // Remount on reload so live state starts from the fresh console data
  return <ScorerConsole key={data.loadedAt} initial={data} onReload={reload} />;
};

export default ScorerConsolePage;
