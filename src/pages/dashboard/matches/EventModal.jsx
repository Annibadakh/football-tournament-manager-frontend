import { useState } from "react";
import FormInput from "@/components/ui/FormInput";
import FormModal from "@/components/ui/FormModal";
import Select from "@/components/ui/Select";
import { MATCH_EVENT_LABEL, MATCH_EVENT_TYPE } from "@/constants/match.constants";
import { addEvent } from "@/services/match.service";
import { apiErrorsToFieldErrors } from "@/utils/form";

const playerOption = (player) => ({
  label: `#${player.jerseyNumber} ${player.fullName}${player.position ? ` (${player.position})` : ""}`,
  value: player.id,
});

// Goal, own goal or card for one team: pick the player (and assist), minute is prefilled
const EventModal = ({ matchId, type, team, squad, minute, onClose, onSaved }) => {
  const [values, setValues] = useState({ playerId: null, assistId: null, minute: String(minute) });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isGoal = type === MATCH_EVENT_TYPE.GOAL;
  const handleChange = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.playerId) return setErrors({ playerId: "Choose the player" });
    setIsSubmitting(true);
    const res = await addEvent(matchId, {
      type,
      teamId: team.id,
      playerId: values.playerId,
      ...(isGoal && values.assistId && { assistId: values.assistId }),
      ...(values.minute !== "" && { minute: Number(values.minute) }),
    });
    setIsSubmitting(false);
    if (res.ok) onSaved(res.data, res.message);
    else setErrors(apiErrorsToFieldErrors(res.errors));
  };

  const title =
    type === MATCH_EVENT_TYPE.OWN_GOAL
      ? `Own goal by ${team.name}`
      : `${MATCH_EVENT_LABEL[type]} · ${team.name}`;

  return (
    <FormModal
      open
      onClose={onClose}
      title={title}
      submitText={`Add ${MATCH_EVENT_LABEL[type].toLowerCase()}`}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      {type === MATCH_EVENT_TYPE.OWN_GOAL && (
        <p className="text-sm text-fg-muted">The goal counts for the other team.</p>
      )}
      <Select
        name="playerId"
        label="Player"
        required
        searchable
        options={squad.map(playerOption)}
        value={values.playerId}
        onChange={handleChange}
        error={errors.playerId}
      />
      {isGoal && (
        <Select
          name="assistId"
          label="Assist (optional)"
          clearable
          searchable
          placeholder="No assist"
          options={squad.filter((player) => player.id !== values.playerId).map(playerOption)}
          value={values.assistId}
          onChange={handleChange}
          error={errors.assistId}
        />
      )}
      <FormInput
        name="minute"
        label="Minute"
        type="number"
        min={0}
        max={200}
        value={values.minute}
        onChange={handleChange}
        error={errors.minute}
        helperText="Filled from the match clock; change it if needed"
      />
    </FormModal>
  );
};

export default EventModal;
