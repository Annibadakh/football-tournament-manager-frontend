import PlayerLink from "@/components/profile/PlayerLink";
import { MATCH_EVENT_TYPE, MATCH_PERIOD_LABEL } from "@/constants/match.constants";
import { cn } from "@/utils/cn";

const EventIcon = ({ type }) => {
  if (type === MATCH_EVENT_TYPE.YELLOW_CARD)
    return <span aria-hidden="true" className="inline-block h-4 w-3 rounded-sm bg-amber-400" />;
  if (type === MATCH_EVENT_TYPE.RED_CARD)
    return <span aria-hidden="true" className="inline-block h-4 w-3 rounded-sm bg-red-600" />;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-4 items-center justify-center rounded-full border-2 text-[8px] font-bold",
        type === MATCH_EVENT_TYPE.OWN_GOAL ? "border-danger text-danger" : "border-fg text-fg",
      )}
    >
      ●
    </span>
  );
};

const describe = (event) => {
  if (event.type === MATCH_EVENT_TYPE.GOAL) return "Goal";
  if (event.type === MATCH_EVENT_TYPE.OWN_GOAL) return "Own goal";
  if (event.type === MATCH_EVENT_TYPE.YELLOW_CARD) return "Yellow card";
  return event.isSecondYellow ? "Red card (second yellow)" : "Red card";
};

/**
 * Match events in order. Home events sit on the left, away on the right;
 * period markers (kick-off, half-time…) become dividers.
 */
const EventTimeline = ({ events, homeTeamId, newestFirst = false }) => {
  const ordered = newestFirst ? [...events].reverse() : events;
  if (!events.some((event) => event.type !== MATCH_EVENT_TYPE.PERIOD))
    return <p className="py-4 text-center text-sm text-fg-muted">No goals or cards yet.</p>;

  return (
    <ol className="flex flex-col gap-1">
      {ordered.map((event) => {
        if (event.type === MATCH_EVENT_TYPE.PERIOD) {
          return (
            <li
              key={event.id}
              className="my-1 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-fg-muted uppercase"
            >
              <span className="h-px flex-1 bg-line" />
              {MATCH_PERIOD_LABEL[event.period]}
              <span className="h-px flex-1 bg-line" />
            </li>
          );
        }
        const isHome = event.team?.id === homeTeamId;
        return (
          <li
            key={event.id}
            className={cn(
              "flex items-center gap-2 text-sm",
              isHome ? "flex-row" : "flex-row-reverse text-right",
            )}
          >
            <span className="w-9 shrink-0 text-center font-brand font-bold text-fg-muted tabular-nums">
              {event.minute}&apos;
            </span>
            <EventIcon type={event.type} />
            <span className="min-w-0">
              <PlayerLink player={event.player} className="font-semibold text-fg" />
              <span className="block text-xs text-fg-muted">
                {describe(event)}
                {event.assist && ` · assist ${event.assist.fullName}`}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default EventTimeline;
