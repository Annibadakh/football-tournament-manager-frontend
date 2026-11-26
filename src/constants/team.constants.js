// Mirrors backend constants/team.constants.js
export const TEAM_STATUS = Object.freeze({
  PENDING_APPROVAL: 1,
  REJECTED: 2,
  AWAITING_PAYMENT: 3,
  CONFIRMED: 4,
  WITHDRAWN: 5,
  REMOVED: 6,
});

export const TEAM_STATUS_LABEL = Object.freeze({
  [TEAM_STATUS.PENDING_APPROVAL]: "Request pending",
  [TEAM_STATUS.REJECTED]: "Rejected",
  [TEAM_STATUS.AWAITING_PAYMENT]: "Awaiting payment",
  [TEAM_STATUS.CONFIRMED]: "Confirmed",
  [TEAM_STATUS.WITHDRAWN]: "Withdrawn",
  [TEAM_STATUS.REMOVED]: "Removed",
});

export const TEAM_STATUS_BADGE = Object.freeze({
  [TEAM_STATUS.PENDING_APPROVAL]: "warning",
  [TEAM_STATUS.REJECTED]: "danger",
  [TEAM_STATUS.AWAITING_PAYMENT]: "accent",
  [TEAM_STATUS.CONFIRMED]: "brand",
  [TEAM_STATUS.WITHDRAWN]: "neutral",
  [TEAM_STATUS.REMOVED]: "neutral",
});

export const TEAM_STATUS_OPTIONS = Object.freeze(
  Object.values(TEAM_STATUS).map((status) => ({ label: TEAM_STATUS_LABEL[status], value: status })),
);

export const LIVE_TEAM_STATUSES = Object.freeze([
  TEAM_STATUS.PENDING_APPROVAL,
  TEAM_STATUS.AWAITING_PAYMENT,
  TEAM_STATUS.CONFIRMED,
]);

export const MEMBER_STATUS = Object.freeze({
  INVITED: 1,
  ACTIVE: 2,
});

export const STAFF_ROLE = Object.freeze({
  SCORER: 1,
  MEDIA_OPERATOR: 2,
});

export const STAFF_ROLE_LABEL = Object.freeze({
  [STAFF_ROLE.SCORER]: "Scorer",
  [STAFF_ROLE.MEDIA_OPERATOR]: "Media operator",
});

export const STAFF_ROLE_OPTIONS = Object.freeze(
  Object.values(STAFF_ROLE).map((role) => ({ label: STAFF_ROLE_LABEL[role], value: role })),
);

export const STAFF_STATUS = Object.freeze({ INVITED: 1, ACTIVE: 2 });

export const REVIEW_DECISION = Object.freeze({ APPROVE: "approve", REJECT: "reject" });

export const VIEWER_ROLE = Object.freeze({
  PUBLIC: "public",
  MEMBER: "member",
  CAPTAIN: "captain",
  MANAGER: "manager",
});

export const TEAM_RULES = Object.freeze({
  NAME_MIN: 2,
  NAME_MAX: 60,
  SHORT_NAME_REGEX: /^[A-Z0-9]{2,4}$/,
  JERSEY_MIN: 1,
  JERSEY_MAX: 99,
  MAX_STAFF_PER_ROLE: 2,
  REJECTION_REASON_MAX: 300,
});

// How a person is added: a verified player from search, or a guest by name + email
export const PERSON_MODE = Object.freeze({ VERIFIED: "verified", GUEST: "guest" });

export const EMPTY_PERSON = Object.freeze({
  mode: PERSON_MODE.VERIFIED,
  player: null,
  fullName: "",
  email: "",
});
