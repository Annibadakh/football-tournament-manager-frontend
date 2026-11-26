import { z } from "zod";
import { PERSON_MODE, TEAM_RULES } from "@/constants/team.constants";
import { emailField, fullNameField } from "@/validations/user.schema";

const jerseyMessage = `Jersey must be ${TEAM_RULES.JERSEY_MIN}–${TEAM_RULES.JERSEY_MAX}`;

export const jerseyField = z.preprocess(
  (value) => (value === "" || value == null ? undefined : Number(value)),
  z
    .number({ error: "Jersey number is required" })
    .int(jerseyMessage)
    .min(TEAM_RULES.JERSEY_MIN, jerseyMessage)
    .max(TEAM_RULES.JERSEY_MAX, jerseyMessage),
);

export const positionField = z.number({ error: "Choose a position" });

export const teamNameField = z
  .string()
  .trim()
  .min(TEAM_RULES.NAME_MIN, "Team name is required")
  .max(TEAM_RULES.NAME_MAX);

export const shortNameField = z
  .string()
  .trim()
  .toUpperCase()
  .regex(TEAM_RULES.SHORT_NAME_REGEX, "Use 2–4 letters or digits, e.g. KFC");

export const teamRequestSchema = z.object({
  name: teamNameField,
  shortName: shortNameField,
  jerseyNumber: jerseyField,
  positionId: positionField,
});

// PersonField value → API shape ({ userId } or { fullName, email })
export const personSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal(PERSON_MODE.VERIFIED),
    player: z.object({ id: z.string() }, { error: "Choose a player" }),
  }),
  z.object({ mode: z.literal(PERSON_MODE.GUEST), fullName: fullNameField, email: emailField }),
]);

export const toPersonPayload = (person) =>
  person.mode === PERSON_MODE.VERIFIED
    ? { userId: person.player.id }
    : { fullName: person.fullName, email: person.email };

export const invitePlayerSchema = z.object({
  person: personSchema,
  positionId: positionField,
  jerseyNumber: jerseyField,
});

export const addTeamSchema = z.object({
  name: teamNameField,
  shortName: shortNameField,
  person: personSchema,
  positionId: positionField,
  jerseyNumber: jerseyField,
});

export const inviteStaffSchema = z.object({
  staffRole: z.number({ error: "Choose a role" }),
  person: personSchema,
});
