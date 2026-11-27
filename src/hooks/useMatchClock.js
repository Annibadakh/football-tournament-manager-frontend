import { useEffect, useState } from "react";
import { MATCH_PERIOD, PLAYING_PERIODS } from "@/constants/match.constants";

// Minute already played when each period starts (mirrors the backend)
export const periodBaseMinute = (period, { halfMinutes, extraTimeHalfMinutes }) => {
  if (period === MATCH_PERIOD.FIRST_HALF) return 0;
  if ([MATCH_PERIOD.HALF_TIME, MATCH_PERIOD.SECOND_HALF].includes(period)) return halfMinutes;
  if ([MATCH_PERIOD.FULL_TIME, MATCH_PERIOD.EXTRA_FIRST_HALF].includes(period))
    return halfMinutes * 2;
  if ([MATCH_PERIOD.EXTRA_HALF_TIME, MATCH_PERIOD.EXTRA_SECOND_HALF].includes(period))
    return halfMinutes * 2 + extraTimeHalfMinutes;
  if (period === MATCH_PERIOD.NOT_STARTED) return 0;
  return halfMinutes * 2 + extraTimeHalfMinutes * 2;
};

const pad = (value) => String(value).padStart(2, "0");

/**
 * Running match clock. serverTime corrects the device clock so every viewer shows the same time.
 * Returns { minute, display: "23:41", isRunning }.
 */
export const computeClock = ({ period, periodStartedAt, settings }, now, offsetMs) => {
  const base = periodBaseMinute(period, settings);
  const isRunning = PLAYING_PERIODS.includes(period) && Boolean(periodStartedAt);
  if (!isRunning) {
    return { minute: base, display: `${pad(base)}:00`, isRunning: false };
  }
  const elapsedMs = Math.max(0, now + offsetMs - new Date(periodStartedAt).getTime());
  const totalSeconds = base * 60 + Math.floor(elapsedMs / 1000);
  return {
    minute: base + Math.floor(elapsedMs / 60000) + 1,
    display: `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`,
    isRunning: true,
  };
};

// state.receivedAt (set when the state arrived) lets us correct for the device clock
const useMatchClock = (state) => {
  const [now, setNow] = useState(() => Date.now());
  const offsetMs =
    state?.serverTime && state?.receivedAt
      ? new Date(state.serverTime).getTime() - state.receivedAt
      : 0;
  const isRunning = state && PLAYING_PERIODS.includes(state.period);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  if (!state) return { minute: 0, display: "00:00", isRunning: false };
  return computeClock(state, now, offsetMs);
};

export default useMatchClock;
