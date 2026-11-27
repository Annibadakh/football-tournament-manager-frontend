import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import AwardsList from "@/components/profile/AwardsList";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormInput from "@/components/ui/FormInput";
import FormModal from "@/components/ui/FormModal";
import Select from "@/components/ui/Select";
import { AWARD_RULES } from "@/constants/award.constants";
import { TOURNAMENT_STATUS } from "@/constants/tournament.constants";
import { MEMBER_STATUS, TEAM_STATUS } from "@/constants/team.constants";
import { createAward, deleteAward, listAwards } from "@/services/profile.service";
import { getTeam, listTournamentTeams } from "@/services/team.service";

const CustomAwardModal = ({ tournamentId, onClose, onSaved }) => {
  const [values, setValues] = useState({
    title: "",
    recipient: "player",
    teamId: null,
    playerId: null,
  });
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listTournamentTeams(tournamentId, { status: TEAM_STATUS.CONFIRMED }).then(
      (res) => res.ok && setTeams(res.data),
    );
  }, [tournamentId]);

  // Player awards pick a team first, then one of its players
  useEffect(() => {
    if (!values.teamId || values.recipient !== "player") return;
    getTeam(values.teamId, { errorToast: false }).then((res) => {
      if (res.ok)
        setPlayers(res.data.members.filter((member) => member.status === MEMBER_STATUS.ACTIVE));
    });
  }, [values.teamId, values.recipient]);

  const handleChange = (name, value) => {
    setValues((current) => ({
      ...current,
      [name]: value,
      ...(name === "teamId" && { playerId: null }),
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (values.title.trim().length < AWARD_RULES.TITLE_MIN) next.title = "Give the award a name";
    if (!values.teamId) next.teamId = "Choose a team";
    if (values.recipient === "player" && !values.playerId) next.playerId = "Choose the player";
    if (Object.keys(next).length) return setErrors(next);
    setIsSubmitting(true);
    const res = await createAward(tournamentId, {
      title: values.title.trim(),
      ...(values.recipient === "player"
        ? { playerId: values.playerId }
        : { teamId: values.teamId }),
    });
    setIsSubmitting(false);
    if (res.ok) onSaved();
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title="Add an award"
      submitText="Add award"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <FormInput
        name="title"
        label="Award"
        required
        placeholder="e.g. Best goalkeeper, Fair play team"
        maxLength={AWARD_RULES.TITLE_MAX}
        value={values.title}
        onChange={handleChange}
        error={errors.title}
      />
      <Select
        name="recipient"
        label="Given to"
        options={[
          { label: "A player", value: "player" },
          { label: "A team", value: "team" },
        ]}
        value={values.recipient}
        onChange={handleChange}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="teamId"
          label="Team"
          required
          searchable
          options={teams.map((team) => ({ label: team.name, value: team.id }))}
          value={values.teamId}
          onChange={handleChange}
          error={errors.teamId}
        />
        {values.recipient === "player" && (
          <Select
            name="playerId"
            label="Player"
            required
            searchable
            disabled={!values.teamId}
            options={players.map((member) => ({
              label: member.player.fullName,
              value: member.player.id,
            }))}
            value={values.playerId}
            onChange={handleChange}
            error={errors.playerId}
          />
        )}
      </div>
    </FormModal>
  );
};

// Organizer: automatic awards appear on completion; custom awards can be added any time
const AwardsManager = ({ tournament }) => {
  const [awards, setAwards] = useState([]);
  const [reloadCount, setReloadCount] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    listAwards(tournament.slug).then((res) => {
      if (isCurrent && res.ok) setAwards(res.data);
    });
    return () => {
      isCurrent = false;
    };
  }, [tournament.slug, reloadCount]);

  const remove = async (award) => {
    setBusyId(award.id);
    const res = await deleteAward(award.id);
    setBusyId(null);
    if (res.ok) setReloadCount((count) => count + 1);
  };

  return (
    <Card
      title="Awards"
      subtitle={
        tournament.status === TOURNAMENT_STATUS.COMPLETED
          ? "Champion, Golden Boot and the other automatic awards were calculated on completion"
          : "Automatic awards are calculated when you mark the tournament completed"
      }
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAdding(true)}
          startIcon={<Plus className="size-4" />}
        >
          Add award
        </Button>
      }
    >
      {awards.length ? (
        <AwardsList
          awards={awards}
          renderActions={(award) =>
            !award.isAutomatic && (
              <Button
                size="sm"
                variant="ghost"
                className="px-2 text-danger"
                loading={busyId === award.id}
                aria-label={`Remove ${award.title}`}
                onClick={() => remove(award)}
                startIcon={<Trash2 className="size-4" />}
              />
            )
          }
        />
      ) : (
        <p className="text-sm text-fg-muted">No awards yet.</p>
      )}
      {isAdding && (
        <CustomAwardModal
          tournamentId={tournament.slug}
          onClose={() => setIsAdding(false)}
          onSaved={() => {
            setIsAdding(false);
            setReloadCount((count) => count + 1);
          }}
        />
      )}
    </Card>
  );
};

export default AwardsManager;
