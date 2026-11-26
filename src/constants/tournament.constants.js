// Mirrors backend constants/tournament.constants.js
export const TOURNAMENT_STATUS = Object.freeze({
  DRAFT: 1,
  REGISTRATION_OPEN: 2,
  ONGOING: 3,
  COMPLETED: 4,
  CANCELLED: 5,
});

export const TOURNAMENT_STATUS_LABEL = Object.freeze({
  [TOURNAMENT_STATUS.DRAFT]: "Draft",
  [TOURNAMENT_STATUS.REGISTRATION_OPEN]: "Registration open",
  [TOURNAMENT_STATUS.ONGOING]: "Ongoing",
  [TOURNAMENT_STATUS.COMPLETED]: "Completed",
  [TOURNAMENT_STATUS.CANCELLED]: "Cancelled",
});

export const TOURNAMENT_STATUS_BADGE = Object.freeze({
  [TOURNAMENT_STATUS.DRAFT]: "neutral",
  [TOURNAMENT_STATUS.REGISTRATION_OPEN]: "accent",
  [TOURNAMENT_STATUS.ONGOING]: "live",
  [TOURNAMENT_STATUS.COMPLETED]: "brand",
  [TOURNAMENT_STATUS.CANCELLED]: "danger",
});

// Action shown on the button that moves a tournament into each status
export const TOURNAMENT_STATUS_ACTION = Object.freeze({
  [TOURNAMENT_STATUS.DRAFT]: "Move back to draft",
  [TOURNAMENT_STATUS.REGISTRATION_OPEN]: "Open registration",
  [TOURNAMENT_STATUS.ONGOING]: "Start tournament",
  [TOURNAMENT_STATUS.COMPLETED]: "Mark as completed",
  [TOURNAMENT_STATUS.CANCELLED]: "Cancel tournament",
});

export const STATUS_TRANSITIONS = Object.freeze({
  [TOURNAMENT_STATUS.DRAFT]: [TOURNAMENT_STATUS.REGISTRATION_OPEN, TOURNAMENT_STATUS.CANCELLED],
  [TOURNAMENT_STATUS.REGISTRATION_OPEN]: [
    TOURNAMENT_STATUS.ONGOING,
    TOURNAMENT_STATUS.DRAFT,
    TOURNAMENT_STATUS.CANCELLED,
  ],
  [TOURNAMENT_STATUS.ONGOING]: [TOURNAMENT_STATUS.COMPLETED, TOURNAMENT_STATUS.CANCELLED],
  [TOURNAMENT_STATUS.COMPLETED]: [],
  [TOURNAMENT_STATUS.CANCELLED]: [],
});

export const PUBLIC_STATUS_OPTIONS = Object.freeze(
  [TOURNAMENT_STATUS.REGISTRATION_OPEN, TOURNAMENT_STATUS.ONGOING, TOURNAMENT_STATUS.COMPLETED].map(
    (status) => ({
      label: TOURNAMENT_STATUS_LABEL[status],
      value: status,
    }),
  ),
);

export const ALL_STATUS_OPTIONS = Object.freeze(
  Object.values(TOURNAMENT_STATUS).map((status) => ({
    label: TOURNAMENT_STATUS_LABEL[status],
    value: status,
  })),
);

export const STRUCTURE_LOCKED_STATUSES = Object.freeze([
  TOURNAMENT_STATUS.ONGOING,
  TOURNAMENT_STATUS.COMPLETED,
  TOURNAMENT_STATUS.CANCELLED,
]);

export const TOURNAMENT_FORMAT = Object.freeze({
  LEAGUE: 1,
  KNOCKOUT: 2,
  GROUP_LEAGUE: 3,
  GROUP_KNOCKOUT: 4,
});

export const TOURNAMENT_FORMAT_OPTIONS = Object.freeze([
  { label: "League (round robin)", value: TOURNAMENT_FORMAT.LEAGUE },
  { label: "Knockout", value: TOURNAMENT_FORMAT.KNOCKOUT },
  { label: "Groups + round robin", value: TOURNAMENT_FORMAT.GROUP_LEAGUE },
  { label: "Groups + knockout", value: TOURNAMENT_FORMAT.GROUP_KNOCKOUT },
]);

export const TOURNAMENT_FORMAT_LABEL = Object.freeze(
  Object.fromEntries(TOURNAMENT_FORMAT_OPTIONS.map(({ label, value }) => [value, label])),
);

export const TOURNAMENT_RULES = Object.freeze({
  NAME_MIN: 3,
  NAME_MAX: 150,
  DESCRIPTION_MAX: 5000,
  VENUE_DETAILS_MAX: 500,
  MIN_TEAMS: 2,
  MAX_TEAMS: 128,
  MIN_SQUAD: 5,
  MAX_SQUAD: 40,
  MAX_POINTS: 10,
  MAX_ENTRY_FEE: 1000000,
  MAX_GROUNDS: 20,
});

export const NEAR_ME_RADIUS_OPTIONS = Object.freeze(
  [10, 25, 50, 100].map((km) => ({ label: `Within ${km} km`, value: km })),
);
export const DEFAULT_NEAR_ME_RADIUS_KM = 25;
