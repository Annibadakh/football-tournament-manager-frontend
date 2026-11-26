import PersonField from "@/components/team/PersonField";
import PositionSelect from "@/components/team/PositionSelect";
import FormInput from "@/components/ui/FormInput";
import FormModal from "@/components/ui/FormModal";
import useForm from "@/hooks/useForm";
import { EMPTY_PERSON } from "@/constants/team.constants";
import { addTeam } from "@/services/team.service";
import { addTeamSchema, toPersonPayload } from "@/validations/team.schema";

const INITIAL_VALUES = {
  name: "",
  shortName: "",
  person: EMPTY_PERSON,
  positionId: null,
  jerseyNumber: "",
};

// Organizer adds a team directly; the captain is fixed and counts as the first player
const AddTeamModal = ({ open, onClose, tournamentId, onAdded }) => {
  const { values, setValues, errors, setErrors, isSubmitting, handleChange, handleSubmit } =
    useForm(INITIAL_VALUES, addTeamSchema);

  const handleClose = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    onClose();
  };

  // Changing the captain resets the position (it must come from the new captain's profile)
  const handlePersonChange = (person) => {
    handleChange("person", person);
    if (person.player !== values.person.player || person.mode !== values.person.mode)
      handleChange("positionId", null);
  };

  const onSubmit = handleSubmit(async (data) => {
    const res = await addTeam(tournamentId, {
      name: data.name,
      shortName: data.shortName,
      captain: toPersonPayload(data.person),
      captainPositionId: data.positionId,
      captainJerseyNumber: data.jerseyNumber,
    });
    if (res.ok) {
      onAdded();
      handleClose();
    }
    return res;
  });

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Add team"
      submitText="Add team"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      size="lg"
    >
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <FormInput
          name="name"
          label="Team name"
          required
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <FormInput
          name="shortName"
          label="Short name"
          required
          maxLength={4}
          placeholder="KFC"
          value={values.shortName}
          onChange={(name, value) => handleChange(name, value.toUpperCase())}
          error={errors.shortName}
        />
      </div>
      <PersonField
        label="Captain"
        value={values.person}
        onChange={handlePersonChange}
        errors={errors}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <PositionSelect
          label="Captain's position"
          person={values.person}
          value={values.positionId}
          onChange={handleChange}
          error={errors.positionId ?? errors.captainPositionId}
        />
        <FormInput
          name="jerseyNumber"
          label="Captain's jersey"
          type="number"
          inputMode="numeric"
          required
          value={values.jerseyNumber}
          onChange={handleChange}
          error={errors.jerseyNumber ?? errors.captainJerseyNumber}
        />
      </div>
    </FormModal>
  );
};

export default AddTeamModal;
