import { z } from "zod";
import { RULE_LIMITS } from "@/constants/rule.constants";
import { TOURNAMENT_RULES } from "@/constants/tournament.constants";
import { USER_RULES } from "@/constants/user.constants";

// Number inputs hold strings; empty means "not set" (null)
const optionalNumber = (min, max, message) =>
  z.preprocess(
    (value) => (value === "" || value == null ? null : Number(value)),
    z
      .number({ error: "Enter a number" })
      .int(message)
      .min(min, message)
      .max(max, message)
      .nullable(),
  );

const optionalDate = z
  .string()
  .nullable()
  .transform((value) => value || null);

export const createTournamentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(TOURNAMENT_RULES.NAME_MIN, "Tournament name is required")
    .max(TOURNAMENT_RULES.NAME_MAX),
  organizerId: z.string({ error: "Choose an organizer" }).min(1, "Choose an organizer"),
  city: z.object({ id: z.string() }, { error: "Select a city" }),
  isStreamingEnabled: z.boolean(),
});

const teamsMessage = `Between ${TOURNAMENT_RULES.MIN_TEAMS} and ${TOURNAMENT_RULES.MAX_TEAMS}`;
const squadMessage = `Between ${TOURNAMENT_RULES.MIN_SQUAD} and ${TOURNAMENT_RULES.MAX_SQUAD}`;
const pointsMessage = `Between 0 and ${TOURNAMENT_RULES.MAX_POINTS}`;

export const tournamentDetailsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(TOURNAMENT_RULES.NAME_MIN, "Tournament name is required")
      .max(TOURNAMENT_RULES.NAME_MAX),
    description: z.string().trim().max(TOURNAMENT_RULES.DESCRIPTION_MAX),
    venue: z.object({ id: z.string() }).nullable(),
    venueDetails: z.string().trim().max(TOURNAMENT_RULES.VENUE_DETAILS_MAX),
    contactPhone: z
      .string()
      .trim()
      .refine(
        (value) => !value || USER_RULES.PHONE_REGEX.test(value),
        "Enter a valid 10-digit mobile number",
      ),
    tournamentFormat: z.number().nullable(),
    gameFormatId: z.number().nullable(),
    ageGroupId: z.number().nullable(),
    genderCategoryId: z.number().nullable(),
    startDate: optionalDate,
    endDate: optionalDate,
    registrationDeadline: optionalDate,
    entryFee: z.preprocess(
      (value) => (value === "" || value == null ? null : Number(value)),
      z
        .number({ error: "Enter an amount" })
        .min(0, "Fee can't be negative")
        .max(TOURNAMENT_RULES.MAX_ENTRY_FEE)
        .nullable(),
    ),
    minTeams: optionalNumber(TOURNAMENT_RULES.MIN_TEAMS, TOURNAMENT_RULES.MAX_TEAMS, teamsMessage),
    maxTeams: optionalNumber(TOURNAMENT_RULES.MIN_TEAMS, TOURNAMENT_RULES.MAX_TEAMS, teamsMessage),
    minSquadSize: optionalNumber(
      TOURNAMENT_RULES.MIN_SQUAD,
      TOURNAMENT_RULES.MAX_SQUAD,
      squadMessage,
    ),
    maxSquadSize: optionalNumber(
      TOURNAMENT_RULES.MIN_SQUAD,
      TOURNAMENT_RULES.MAX_SQUAD,
      squadMessage,
    ),
    pointsWin: optionalNumber(0, TOURNAMENT_RULES.MAX_POINTS, pointsMessage).pipe(
      z.number({ error: "Required" }),
    ),
    pointsDraw: optionalNumber(0, TOURNAMENT_RULES.MAX_POINTS, pointsMessage).pipe(
      z.number({ error: "Required" }),
    ),
    pointsLoss: optionalNumber(0, TOURNAMENT_RULES.MAX_POINTS, pointsMessage).pipe(
      z.number({ error: "Required" }),
    ),
    organizerId: z.string().nullable(),
    city: z.object({ id: z.string() }).nullable(),
    isStreamingEnabled: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const addIssue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      addIssue("endDate", "End date can't be before the start date");
    }
    if (
      values.registrationDeadline &&
      values.startDate &&
      values.registrationDeadline > values.startDate
    ) {
      addIssue("registrationDeadline", "Must be on or before the start date");
    }
    if (values.minTeams && values.maxTeams && values.minTeams > values.maxTeams) {
      addIssue("minTeams", "Can't be more than maximum teams");
    }
    if (values.minSquadSize && values.maxSquadSize && values.minSquadSize > values.maxSquadSize) {
      addIssue("minSquadSize", "Can't be more than maximum squad size");
    }
    if (!(values.pointsWin >= values.pointsDraw && values.pointsDraw >= values.pointsLoss)) {
      addIssue("pointsWin", "Points must be win ≥ draw ≥ loss");
    }
  });

export const ruleSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(RULE_LIMITS.TITLE_MAX),
  description: z.string().trim().min(3, "Description is required").max(RULE_LIMITS.DESCRIPTION_MAX),
  category: z.number({ error: "Choose a category" }),
  isActive: z.boolean(),
});
