import PersonField from "@/components/team/PersonField";
import PositionSelect from "@/components/team/PositionSelect";
import FormInput from "@/components/ui/FormInput";
import FormModal from "@/components/ui/FormModal";
import useForm from "@/hooks/useForm";
import { EMPTY_PERSON } from "@/constants/team.constants";
import { invitePlayer } from "@/services/team.service";
import { invitePlayerSchema, toPersonPayload } from "@/validations/team.schema";

const INITIAL_VALUES = { person: EMPTY_PERSON, positionId: null, jerseyNumber: "" };

const InvitePlayerModal = ({ open, onClose, teamId, onInvited }) => {
  const { values, setValues, errors, setErrors, isSubmitting, handleChange, handleSubmit } =
    useForm(INITIAL_VALUES, invitePlayerSchema);

  const handleClose = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    onClose();
  };

  const handlePersonChange = (person) => {
    handleChange("person", person);
    if (person.player !== values.person.player || person.mode !== values.person.mode)
      handleChange("positionId", null);
  };

  const onSubmit = handleSubmit(async (data) => {
    const res = await invitePlayer(teamId, {
      player: toPersonPayload(data.person),
      positionId: data.positionId,
      jerseyNumber: data.jerseyNumber,
    });
    if (res.ok) {
      onInvited();
      handleClose();
    }
    return res;
  });

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Invite a player"
      submitText="Send invite"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      size="lg"
    >
      <PersonField
        label="Player"
        value={values.person}
        onChange={handlePersonChange}
        errors={errors}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <PositionSelect
          person={values.person}
          value={values.positionId}
          onChange={handleChange}
          error={errors.positionId}
        />
        <FormInput
          name="jerseyNumber"
          label="Jersey number"
          type="number"
          inputMode="numeric"
          required
          value={values.jerseyNumber}
          onChange={handleChange}
          error={errors.jerseyNumber}
        />
      </div>
    </FormModal>
  );
};

export default InvitePlayerModal;
