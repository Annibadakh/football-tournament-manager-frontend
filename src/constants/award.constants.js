// Mirrors backend constants/award.constants.js
export const AWARD_TYPE = Object.freeze({
  CHAMPION: 1,
  RUNNER_UP: 2,
  THIRD_PLACE: 3,
  GROUP_WINNER: 4,
  GOLDEN_BOOT: 5,
  MOST_ASSISTS: 6,
  MOST_POTM: 7,
  CUSTOM: 10,
});

// Unit shown next to an award's value, e.g. "Golden Boot · 7 goals"
export const AWARD_VALUE_UNIT = Object.freeze({
  [AWARD_TYPE.GOLDEN_BOOT]: "goals",
  [AWARD_TYPE.MOST_ASSISTS]: "assists",
  [AWARD_TYPE.MOST_POTM]: "times",
});

export const TEAM_PLACING_TYPES = Object.freeze([
  AWARD_TYPE.CHAMPION,
  AWARD_TYPE.RUNNER_UP,
  AWARD_TYPE.THIRD_PLACE,
  AWARD_TYPE.GROUP_WINNER,
]);

export const AWARD_RULES = Object.freeze({ TITLE_MIN: 3, TITLE_MAX: 80 });

export const EXPORT_KIND = Object.freeze({
  STANDINGS: "standings",
  FIXTURES: "fixtures",
  SUMMARY: "summary",
});

// "Golden Boot · 7 goals"
export const awardLabel = (award) =>
  award.value && AWARD_VALUE_UNIT[award.type]
    ? `${award.title} · ${award.value} ${AWARD_VALUE_UNIT[award.type]}`
    : award.title;
