import { useState } from "react";
import { toast } from "sonner";
import FormInput from "@/components/ui/FormInput";
import FormModal from "@/components/ui/FormModal";
import Select from "@/components/ui/Select";
import { addMatch, updateMatch } from "@/services/match.service";
import { apiErrorsToFieldErrors } from "@/utils/form";
import { fromIstInputValue, toIstInputValue } from "@/utils/match";

// Add a match, or edit teams / ground / kick-off of a match that hasn't started
const MatchFormModal = ({ tournament, match = null, teams, grounds, onClose, onSaved }) => {
  const isEdit = Boolean(match);
  const [values, setValues] = useState({
    homeTeamId: match?.homeTeam?.id ?? null,
    awayTeamId: match?.awayTeam?.id ?? null,
    groundId: match?.ground?.id ?? null,
    kickoff: toIstInputValue(match?.scheduledAt),
    roundName: match?.roundName ?? "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };
  const teamOptions = teams.map((team) => ({ label: team.name, value: team.id }));
  const groundOptions = grounds.map((ground) => ({ label: ground.name, value: ground.id }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isEdit && (!values.homeTeamId || !values.awayTeamId)) {
      return setErrors({
        homeTeamId: values.homeTeamId ? undefined : "Choose the home team",
        awayTeamId: values.awayTeamId ? undefined : "Choose the away team",
      });
    }
    const payload = {
      ...(values.homeTeamId && { homeTeamId: values.homeTeamId }),
      ...(values.awayTeamId && { awayTeamId: values.awayTeamId }),
      groundId: values.groundId,
      scheduledAt: fromIstInputValue(values.kickoff),
      ...(values.roundName.trim() && { roundName: values.roundName.trim() }),
    };
    setIsSubmitting(true);
    const res = isEdit
      ? await updateMatch(match.id, payload)
      : await addMatch(tournament.slug, payload);
    setIsSubmitting(false);
    if (!res.ok) return setErrors(apiErrorsToFieldErrors(res.errors));
    res.data.warnings.forEach((warning) => toast.warning(warning.message));
    onSaved();
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title={isEdit ? `Edit match M${match.matchNumber}` : "Add a match"}
      submitText={isEdit ? "Save match" : "Add match"}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="homeTeamId"
          label="Home team"
          required={!isEdit}
          searchable
          placeholder={match?.homePlaceholder ?? "Choose a team"}
          options={teamOptions}
          value={values.homeTeamId}
          onChange={handleChange}
          error={errors.homeTeamId}
        />
        <Select
          name="awayTeamId"
          label="Away team"
          required={!isEdit}
          searchable
          placeholder={match?.awayPlaceholder ?? "Choose a team"}
          options={teamOptions}
          value={values.awayTeamId}
          onChange={handleChange}
          error={errors.awayTeamId}
        />
        <Select
          name="groundId"
          label="Ground"
          clearable
          placeholder="No ground yet"
          options={groundOptions}
          value={values.groundId}
          onChange={handleChange}
          error={errors.groundId}
        />
        <FormInput
          name="kickoff"
          label="Kick-off (IST)"
          type="datetime-local"
          value={values.kickoff}
          onChange={handleChange}
          error={errors.scheduledAt}
          helperText="Leave empty for Time TBA"
        />
      </div>
      <FormInput
        name="roundName"
        label="Round name (optional)"
        placeholder="e.g. Round 1, Friendly"
        maxLength={40}
        value={values.roundName}
        onChange={handleChange}
        error={errors.roundName}
      />
    </FormModal>
  );
};

export default MatchFormModal;
