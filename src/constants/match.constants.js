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

export const MATCH_PERIOD = Object.freeze({
  NOT_STARTED: 0,
  FIRST_HALF: 1,
  HALF_TIME: 2,
  SECOND_HALF: 3,
  FULL_TIME: 4,
  EXTRA_FIRST_HALF: 5,
  EXTRA_HALF_TIME: 6,
  EXTRA_SECOND_HALF: 7,
  FINISHED: 8,
});

export const MATCH_PERIOD_LABEL = Object.freeze({
  [MATCH_PERIOD.NOT_STARTED]: "Not started",
  [MATCH_PERIOD.FIRST_HALF]: "1st half",
  [MATCH_PERIOD.HALF_TIME]: "Half-time",
  [MATCH_PERIOD.SECOND_HALF]: "2nd half",
  [MATCH_PERIOD.FULL_TIME]: "Full time",
  [MATCH_PERIOD.EXTRA_FIRST_HALF]: "Extra time 1st half",
  [MATCH_PERIOD.EXTRA_HALF_TIME]: "Extra-time break",
  [MATCH_PERIOD.EXTRA_SECOND_HALF]: "Extra time 2nd half",
  [MATCH_PERIOD.FINISHED]: "Finished",
});

// Button text for moving the clock to a period
export const PERIOD_ACTION_LABEL = Object.freeze({
  [MATCH_PERIOD.FIRST_HALF]: "Kick off",
  [MATCH_PERIOD.HALF_TIME]: "Half-time",
  [MATCH_PERIOD.SECOND_HALF]: "Start 2nd half",
  [MATCH_PERIOD.FULL_TIME]: "Full time",
  [MATCH_PERIOD.EXTRA_FIRST_HALF]: "Start extra time",
  [MATCH_PERIOD.EXTRA_HALF_TIME]: "Extra-time break",
  [MATCH_PERIOD.EXTRA_SECOND_HALF]: "Start ET 2nd half",
  [MATCH_PERIOD.FINISHED]: "End extra time",
});

// Mirrors backend PERIOD_TRANSITIONS (extra time only in knockouts)
export const NEXT_PERIOD = Object.freeze({
  [MATCH_PERIOD.NOT_STARTED]: MATCH_PERIOD.FIRST_HALF,
  [MATCH_PERIOD.FIRST_HALF]: MATCH_PERIOD.HALF_TIME,
  [MATCH_PERIOD.HALF_TIME]: MATCH_PERIOD.SECOND_HALF,
  [MATCH_PERIOD.SECOND_HALF]: MATCH_PERIOD.FULL_TIME,
  [MATCH_PERIOD.FULL_TIME]: MATCH_PERIOD.EXTRA_FIRST_HALF,
  [MATCH_PERIOD.EXTRA_FIRST_HALF]: MATCH_PERIOD.EXTRA_HALF_TIME,
  [MATCH_PERIOD.EXTRA_HALF_TIME]: MATCH_PERIOD.EXTRA_SECOND_HALF,
  [MATCH_PERIOD.EXTRA_SECOND_HALF]: MATCH_PERIOD.FINISHED,
});

export const PLAYING_PERIODS = Object.freeze([
  MATCH_PERIOD.FIRST_HALF,
  MATCH_PERIOD.SECOND_HALF,
  MATCH_PERIOD.EXTRA_FIRST_HALF,
  MATCH_PERIOD.EXTRA_SECOND_HALF,
]);

export const MATCH_EVENT_TYPE = Object.freeze({
  GOAL: 1,
  OWN_GOAL: 2,
  YELLOW_CARD: 3,
  RED_CARD: 4,
  PERIOD: 5,
});

export const MATCH_EVENT_LABEL = Object.freeze({
  [MATCH_EVENT_TYPE.GOAL]: "Goal",
  [MATCH_EVENT_TYPE.OWN_GOAL]: "Own goal",
  [MATCH_EVENT_TYPE.YELLOW_CARD]: "Yellow card",
  [MATCH_EVENT_TYPE.RED_CARD]: "Red card",
});

export const DECIDED_BY = Object.freeze({
  REGULAR: 1,
  EXTRA_TIME: 2,
  PENALTIES: 3,
  TIE: 4,
});

export const DECIDED_BY_NOTE = Object.freeze({
  [DECIDED_BY.EXTRA_TIME]: "after extra time",
  [DECIDED_BY.PENALTIES]: "on penalties",
  [DECIDED_BY.TIE]: "declared a tie",
});

export const CARD_NOTICE_REASON = Object.freeze({
  RED_CARD: 1,
  YELLOW_CARDS: 2,
});

export const LIVE_POLL_MS = 10000;
