import { APP_TIMEZONE } from "@/constants/common.constants";

// Team name, or the placeholder while a knockout slot is still open
export const sideLabel = (match, side) =>
  match[`${side}Team`]?.name ?? match[`${side}Placeholder`] ?? "To be decided";

export const sideShort = (match, side) =>
  match[`${side}Team`]?.shortName ?? (match[`${side}Placeholder`] ? "TBD" : "—");

// Kick-offs are planned in Indian time: "2027-04-10T09:30" ⇄ ISO with +05:30
export const toIstInputValue = (iso) => {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
};

export const fromIstInputValue = (value) => (value ? `${value}:00+05:30` : null);

// IST calendar day of a kick-off, for grouping lists by date
export const istDateKey = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: APP_TIMEZONE }) : null;

// [{ key, title, matches }] in the order matches arrive (stage → round → number)
export const groupByRound = (matches) => {
  const groups = new Map();
  matches.forEach((match) => {
    const key = `${match.stage}-${match.isThirdPlace ? "third" : match.roundNumber}`;
    if (!groups.has(key)) {
      groups.set(key, { key, title: match.roundName ?? `Round ${match.roundNumber}`, matches: [] });
    }
    groups.get(key).matches.push(match);
  });
  return [...groups.values()];
};

export const groupByDate = (matches) => {
  const groups = new Map();
  matches.forEach((match) => {
    const key = istDateKey(match.scheduledAt) ?? "tba";
    if (!groups.has(key)) groups.set(key, { key, matches: [] });
    groups.get(key).matches.push(match);
  });
  return [...groups.values()].sort((a, b) =>
    a.key === "tba" ? 1 : b.key === "tba" ? -1 : a.key.localeCompare(b.key),
  );
};

const kickoffDay = new Intl.DateTimeFormat("en-IN", {
  timeZone: APP_TIMEZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});
const kickoffTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: APP_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
});

// "Sat, 10 Apr" and "9:00 am" in Indian time; "Time TBA" when unscheduled
export const formatKickoffDay = (iso) => (iso ? kickoffDay.format(new Date(iso)) : "Date TBA");
export const formatKickoffTime = (iso) => (iso ? kickoffTime.format(new Date(iso)) : "Time TBA");
export const formatKickoff = (iso) =>
  iso ? `${formatKickoffDay(iso)} · ${formatKickoffTime(iso)}` : "Time TBA";
