// Mirrors backend constants/match.constants.js
export const MATCH_STAGE = Object.freeze({
  LEAGUE: 1,
  GROUP: 2,
  KNOCKOUT: 3,
});

export const MATCH_STAGE_LABEL = Object.freeze({
  [MATCH_STAGE.LEAGUE]: "League",
  [MATCH_STAGE.GROUP]: "Group stage",
  [MATCH_STAGE.KNOCKOUT]: "Knockout",
});

export const MATCH_STATUS = Object.freeze({
  SCHEDULED: 1,
  LIVE: 2,
  COMPLETED: 3,
  CANCELLED: 4,
  WALKOVER: 5,
  FORFEIT: 6,
});

export const MATCH_STATUS_LABEL = Object.freeze({
  [MATCH_STATUS.SCHEDULED]: "Scheduled",
  [MATCH_STATUS.LIVE]: "Live",
  [MATCH_STATUS.COMPLETED]: "Full time",
  [MATCH_STATUS.CANCELLED]: "Cancelled",
  [MATCH_STATUS.WALKOVER]: "Walkover",
  [MATCH_STATUS.FORFEIT]: "Forfeit",
});

export const MATCH_STATUS_BADGE = Object.freeze({
  [MATCH_STATUS.SCHEDULED]: "neutral",
  [MATCH_STATUS.LIVE]: "live",
  [MATCH_STATUS.COMPLETED]: "brand",
  [MATCH_STATUS.CANCELLED]: "danger",
  [MATCH_STATUS.WALKOVER]: "warning",
  [MATCH_STATUS.FORFEIT]: "warning",
});

export const FINISHED_MATCH_STATUSES = Object.freeze([
  MATCH_STATUS.COMPLETED,
  MATCH_STATUS.WALKOVER,
  MATCH_STATUS.FORFEIT,
]);

export const FIXTURE_RULES = Object.freeze({
  MAX_GROUPS: 16,
  MIN_SLOT_MINUTES: 10,
  MAX_SLOT_MINUTES: 300,
  BREAK_MINUTES: 15,
});

// Formats that use groups
export const GROUP_FORMATS = Object.freeze([3, 4]);
export const KNOCKOUT_FORMATS = Object.freeze([2, 4]);
export const ROUND_ROBIN_FORMATS = Object.freeze([1, 3, 4]);
