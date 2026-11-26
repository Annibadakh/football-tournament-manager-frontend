import { Mail, UserRound } from "lucide-react";
import PlayerPicker from "@/components/team/PlayerPicker";
import FormInput from "@/components/ui/FormInput";
import { PERSON_MODE } from "@/constants/team.constants";
import { cn } from "@/utils/cn";

const MODES = [
  { value: PERSON_MODE.VERIFIED, label: "Verified player" },
  { value: PERSON_MODE.GUEST, label: "Guest (by email)" },
];

/**
 * Picks a verified player from search or describes a guest (name + email).
 * errors are keyed like the form: "person.player", "person.fullName", "person.email".
 */
const PersonField = ({ label, value, onChange, errors = {} }) => (
  <fieldset className="flex flex-col gap-3">
    <legend className="mb-2 text-xs font-semibold text-fg-muted">{label}</legend>
    <div
      role="radiogroup"
      className="inline-flex w-fit rounded-lg border border-line bg-surface p-0.5"
    >
      {MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          role="radio"
          aria-checked={value.mode === mode.value}
          onClick={() => onChange({ ...value, mode: mode.value })}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-semibold",
            value.mode === mode.value ? "bg-brand-600 text-white" : "text-fg-muted hover:text-fg",
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
    {value.mode === PERSON_MODE.VERIFIED ? (
      <PlayerPicker
        value={value.player}
        onChange={(player) => onChange({ ...value, player })}
        error={errors["person.player"] ?? errors.person}
      />
    ) : (
      <div className="grid gap-3 sm:grid-cols-2">
        <FormInput
          name="fullName"
          label="Full name"
          required
          value={value.fullName}
          onChange={(_, fullName) => onChange({ ...value, fullName })}
          error={errors["person.fullName"]}
          startIcon={<UserRound className="size-4" />}
        />
        <FormInput
          name="email"
          label="Email"
          type="email"
          required
          value={value.email}
          onChange={(_, email) => onChange({ ...value, email })}
          error={errors["person.email"] ?? errors.player ?? errors.captain}
          helperText="They get an email to join and set up their account"
          startIcon={<Mail className="size-4" />}
        />
      </div>
    )}
  </fieldset>
);

export default PersonField;
