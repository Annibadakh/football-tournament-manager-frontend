// Mirrors backend constants/rule.constants.js
export const RULE_CATEGORY = Object.freeze({
  GENERAL: 1,
  MATCH: 2,
  DISCIPLINE: 3,
  ELIGIBILITY: 4,
});

export const RULE_CATEGORY_OPTIONS = Object.freeze([
  { label: "General", value: RULE_CATEGORY.GENERAL },
  { label: "Match", value: RULE_CATEGORY.MATCH },
  { label: "Discipline", value: RULE_CATEGORY.DISCIPLINE },
  { label: "Eligibility", value: RULE_CATEGORY.ELIGIBILITY },
]);

export const RULE_CATEGORY_LABEL = Object.freeze(
  Object.fromEntries(RULE_CATEGORY_OPTIONS.map(({ label, value }) => [value, label])),
);

export const RULE_LIMITS = Object.freeze({ TITLE_MAX: 150, DESCRIPTION_MAX: 2000 });
