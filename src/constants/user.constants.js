// Mirrors backend constants/user.constants.js (backend is the source of truth)
export const ACCOUNT_ROLE = Object.freeze({
  SUPERADMIN: 1,
  ADMIN: 2,
  ORGANIZER: 3,
  MEMBER: 4,
});

export const ACCOUNT_ROLE_LABEL = Object.freeze({
  [ACCOUNT_ROLE.SUPERADMIN]: "Super Admin",
  [ACCOUNT_ROLE.ADMIN]: "Admin",
  [ACCOUNT_ROLE.ORGANIZER]: "Organizer",
  [ACCOUNT_ROLE.MEMBER]: "Member",
});

export const ACCOUNT_STATUS = Object.freeze({
  GUEST: 1,
  PENDING_VERIFICATION: 2,
  VERIFIED: 3,
  BLOCKED: 4,
});

export const ACCOUNT_STATUS_LABEL = Object.freeze({
  [ACCOUNT_STATUS.GUEST]: "Invite pending",
  [ACCOUNT_STATUS.PENDING_VERIFICATION]: "Unverified",
  [ACCOUNT_STATUS.VERIFIED]: "Verified",
  [ACCOUNT_STATUS.BLOCKED]: "Blocked",
});

export const ACCOUNT_STATUS_BADGE = Object.freeze({
  [ACCOUNT_STATUS.GUEST]: "neutral",
  [ACCOUNT_STATUS.PENDING_VERIFICATION]: "warning",
  [ACCOUNT_STATUS.VERIFIED]: "brand",
  [ACCOUNT_STATUS.BLOCKED]: "danger",
});

export const GENDER = Object.freeze({
  MALE: 1,
  FEMALE: 2,
  OTHER: 3,
});

export const GENDER_OPTIONS = Object.freeze([
  { label: "Male", value: GENDER.MALE },
  { label: "Female", value: GENDER.FEMALE },
  { label: "Other", value: GENDER.OTHER },
]);

// Which roles each role may create (backend enforces the same rule)
export const CREATABLE_ROLES_BY_ROLE = Object.freeze({
  [ACCOUNT_ROLE.SUPERADMIN]: [ACCOUNT_ROLE.ADMIN, ACCOUNT_ROLE.ORGANIZER],
  [ACCOUNT_ROLE.ADMIN]: [ACCOUNT_ROLE.ORGANIZER],
});

export const USER_RULES = Object.freeze({
  FULL_NAME_MIN: 2,
  FULL_NAME_MAX: 100,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 64,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  PHONE_LENGTH: 10,
  CITY_MAX: 100,
  BIO_MAX: 500,
  MAX_POSITIONS: 4,
  OTP_LENGTH: 6,
  OTP_RESEND_SECONDS: 60,
});

export const PHONE_PREFIX = "+91";

export const PASSWORD_HINT = `${USER_RULES.PASSWORD_MIN}+ characters with at least one letter and one number`;
