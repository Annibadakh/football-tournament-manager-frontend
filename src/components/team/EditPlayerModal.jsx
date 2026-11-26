import { z } from "zod";
import FormInput from "@/components/ui/FormInput";
import FormModal from "@/components/ui/FormModal";
import Select from "@/components/ui/Select";
import useForm from "@/hooks/useForm";
import usePositions from "@/hooks/usePositions";
import { updatePlayer } from "@/services/team.service";
import { jerseyField, positionField } from "@/validations/team.schema";

const editPlayerSchema = z.object({ jerseyNumber: jerseyField, positionId: positionField });

// Jersey and position can change until the squad is locked; the API re-checks profile positions
const EditPlayerModal = ({ teamId, member, onClose, onSaved }) => {
  const positions = usePositions();
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { jerseyNumber: String(member.jerseyNumber), positionId: member.position?.id ?? null },
    editPlayerSchema,
  );

  const onSubmit = handleSubmit(async (data) => {
    const res = await updatePlayer(teamId, member.id, data);
    if (res.ok) onSaved();
    return res;
  });

  return (
    <FormModal
      open
      onClose={onClose}
      title={`Edit ${member.player.fullName}`}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      size="sm"
    >
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
      <Select
        name="positionId"
        label="Position"
        required
        options={positions.map((position) => ({ label: position.name, value: position.id }))}
        value={values.positionId}
        onChange={handleChange}
        error={errors.positionId}
        helperText={
          member.player.isVerified ? "Must be one of the player's profile positions" : undefined
        }
      />
    </FormModal>
  );
};

export default EditPlayerModal;
