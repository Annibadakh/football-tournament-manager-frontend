// Mirrors backend constants/stream.constants.js
export const STREAM_STATUS = Object.freeze({
  SCHEDULED: 1,
  LIVE: 2,
  ENDED: 3,
});

export const STREAM_STATUS_LABEL = Object.freeze({
  [STREAM_STATUS.SCHEDULED]: "Upcoming",
  [STREAM_STATUS.LIVE]: "Live",
  [STREAM_STATUS.ENDED]: "Replay",
});

export const STREAM_STATUS_BADGE = Object.freeze({
  [STREAM_STATUS.SCHEDULED]: "info",
  [STREAM_STATUS.LIVE]: "live",
  [STREAM_STATUS.ENDED]: "neutral",
});

export const STREAM_RULES = Object.freeze({
  TITLE_MAX: 120,
  URL_MAX: 300,
});
