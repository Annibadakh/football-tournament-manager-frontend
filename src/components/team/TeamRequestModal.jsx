import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import FormInput from "@/components/ui/FormInput";
import FormModal from "@/components/ui/FormModal";
import Select from "@/components/ui/Select";
import useForm from "@/hooks/useForm";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { requestTeam } from "@/services/team.service";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { teamRequestSchema } from "@/validations/team.schema";

const INITIAL_VALUES = { name: "", shortName: "", jerseyNumber: "", positionId: null };

// A verified player asks to register a team; they become its captain and first player
const TeamRequestModal = ({ open, onClose, tournament }) => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const { values, setValues, errors, setErrors, isSubmitting, handleChange, handleSubmit } =
    useForm(INITIAL_VALUES, teamRequestSchema);
  const positionOptions = user.positions.map((position) => ({
    label: position.name,
    value: position.id,
  }));

  const handleClose = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    const res = await requestTeam(tournament.slug, data);
    if (res.ok) navigate(buildPath(ROUTES.TEAM, { teamId: res.data.id }));
    return res;
  });

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={`Register a team for ${tournament.name}`}
      submitText="Send request"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    >
      <p className="text-sm text-fg-muted">
        You&apos;ll be the captain. The organizer reviews your request; once confirmed you can
        invite your players.
      </p>
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
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="positionId"
          label="Your position"
          required
          options={positionOptions}
          value={values.positionId}
          onChange={handleChange}
          error={errors.positionId}
          emptyMessage="Add positions on your profile first"
        />
        <FormInput
          name="jerseyNumber"
          label="Your jersey number"
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

export default TeamRequestModal;
