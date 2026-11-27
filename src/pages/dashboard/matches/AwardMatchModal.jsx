import { useState } from "react";
import FormModal from "@/components/ui/FormModal";
import Select from "@/components/ui/Select";
import { awardMatch } from "@/services/match.service";

const TYPE_OPTIONS = [
  { label: "Walkover (the other team didn't show up)", value: "walkover" },
  { label: "Forfeit (a team conceded or was disqualified)", value: "forfeit" },
];

// Organizer only: the awarded team gets the win and a 3–0 score for the table
const AwardMatchModal = ({ match, onClose, onAwarded }) => {
  const [values, setValues] = useState({ type: "walkover", winnerTeamId: null });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.winnerTeamId) return setError("Choose the team that is awarded the match");
    setIsSubmitting(true);
    const res = await awardMatch(match.id, values);
    setIsSubmitting(false);
    if (res.ok) onAwarded(res.data);
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title="Walkover or forfeit"
      submitText="Award match"
      submitVariant="danger"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <Select
        name="type"
        label="Type"
        options={TYPE_OPTIONS}
        value={values.type}
        onChange={(_, type) => setValues((current) => ({ ...current, type }))}
      />
      <Select
        name="winnerTeamId"
        label="Awarded to"
        required
        options={[match.homeTeam, match.awayTeam].map((team) => ({
          label: team.name,
          value: team.id,
        }))}
        value={values.winnerTeamId}
        onChange={(_, winnerTeamId) => {
          setValues((current) => ({ ...current, winnerTeamId }));
          setError(null);
        }}
        error={error}
      />
      <p className="text-sm text-fg-muted">
        The awarded team wins 3–0 in the table. No player goals are counted.
      </p>
    </FormModal>
  );
};

export default AwardMatchModal;
