import { useEffect, useRef, useState } from "react";
import { LIVE_POLL_MS, MATCH_STATUS } from "@/constants/match.constants";
import { getLive } from "@/services/match.service";

/**
 * Keeps a match's live state fresh while it is live: polls the light endpoint every 10 s
 * with the last version, merging only when something changed. Socket.IO can replace this later.
 */
const useLiveMatch = (matchId, initial) => {
  const [live, setLive] = useState(() => initial && { ...initial, receivedAt: Date.now() });
  const versionRef = useRef(initial?.version);
  const isLive = live?.status === MATCH_STATUS.LIVE;

  useEffect(() => {
    if (!isLive) return undefined;
    let isCurrent = true;
    const poll = async () => {
      const res = await getLive(matchId, versionRef.current, { errorToast: false });
      if (!isCurrent || !res.ok || res.data.unchanged) return;
      versionRef.current = res.data.version;
      setLive((current) => ({ ...current, ...res.data, receivedAt: Date.now() }));
    };
    const timer = setInterval(poll, LIVE_POLL_MS);
    return () => {
      isCurrent = false;
      clearInterval(timer);
    };
  }, [matchId, isLive]);

  // Callers apply their own fresh state (e.g. after a scorer action)
  const replace = (next) => {
    versionRef.current = next.version;
    setLive((current) => ({ ...current, ...next, receivedAt: Date.now() }));
  };

  return [live, replace];
};

export default useLiveMatch;
