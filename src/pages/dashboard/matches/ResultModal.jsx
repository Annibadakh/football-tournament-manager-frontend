import { useState } from "react";
import FormModal from "@/components/ui/FormModal";
import Select from "@/components/ui/Select";
import { DECIDED_BY, MATCH_PERIOD, MATCH_STAGE } from "@/constants/match.constants";
import { declareResult } from "@/services/match.service";
import { apiErrorsToFieldErrors } from "@/utils/form";

const LEVEL_KNOCKOUT_OPTIONS = [
  { label: "Penalty shootout", value: DECIDED_BY.PENALTIES },
  { label: "Tie (shared, no winner)", value: DECIDED_BY.TIE },
];

// Final whistle: confirms the score, how a level knockout was decided, and Player of the Match
const ResultModal = ({ match, squads, onClose, onDeclared }) => {
  const isLevel = match.homeScore === match.awayScore;
  const isKnockout = match.stage === MATCH_STAGE.KNOCKOUT;
  const [values, setValues] = useState({
    decidedBy: isLevel && isKnockout ? DECIDED_BY.PENALTIES : null,
    winnerTeamId: null,
    potmPlayerId: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const leader = match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam;
  const summary = !isLevel
    ? `${leader.name} win ${Math.max(match.homeScore, match.awayScore)}–${Math.min(match.homeScore, match.awayScore)}${match.period === MATCH_PERIOD.FINISHED ? " after extra time" : ""}`
    : isKnockout
      ? `Level at ${match.homeScore}–${match.awayScore}. A knockout needs a winner.`
      : `Draw ${match.homeScore}–${match.awayScore}`;

  const potmOptions = [
    ...squads.home.map((player) => ({
      label: `${player.fullName} (${match.homeTeam.shortName})`,
      value: player.id,
    })),
    ...squads.away.map((player) => ({
      label: `${player.fullName} (${match.awayTeam.shortName})`,
      value: player.id,
    })),
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLevel && isKnockout && values.decidedBy === DECIDED_BY.PENALTIES && !values.winnerTeamId)
      return setErrors({ winnerTeamId: "Choose who won the shootout" });
    setIsSubmitting(true);
    const res = await declareResult(match.id, {
      ...(isLevel && isKnockout && { decidedBy: values.decidedBy }),
      ...(values.decidedBy === DECIDED_BY.PENALTIES &&
        values.winnerTeamId && { winnerTeamId: values.winnerTeamId }),
      ...(values.potmPlayerId && { potmPlayerId: values.potmPlayerId }),
    });
    setIsSubmitting(false);
    if (res.ok) onDeclared(res.data);
    else setErrors(apiErrorsToFieldErrors(res.errors));
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title="Declare the result"
      submitText="Declare result"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <p className="rounded-lg bg-surface-muted px-3 py-2 text-sm font-semibold text-fg">
        {summary}
      </p>
      {isLevel && isKnockout && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            name="decidedBy"
            label="Decided by"
            required
            options={LEVEL_KNOCKOUT_OPTIONS}
            value={values.decidedBy}
            onChange={handleChange}
            error={errors.decidedBy}
          />
          {values.decidedBy === DECIDED_BY.PENALTIES && (
            <Select
              name="winnerTeamId"
              label="Shootout winner"
              required
              options={[match.homeTeam, match.awayTeam].map((team) => ({
                label: team.name,
                value: team.id,
              }))}
              value={values.winnerTeamId}
              onChange={handleChange}
              error={errors.winnerTeamId}
            />
          )}
        </div>
      )}
      {errors.decidedBy && !(isLevel && isKnockout) && (
        <p className="text-sm text-danger">{errors.decidedBy}</p>
      )}
      <Select
        name="potmPlayerId"
        label="Player of the Match (optional)"
        clearable
        searchable
        placeholder="Not chosen"
        options={potmOptions}
        value={values.potmPlayerId}
        onChange={handleChange}
        error={errors.potmPlayerId}
      />
      <p className="text-xs text-fg-muted">Scores are locked once the result is declared.</p>
    </FormModal>
  );
};

export default ResultModal;
