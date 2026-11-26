import PersonField from "@/components/team/PersonField";
import FormModal from "@/components/ui/FormModal";
import Select from "@/components/ui/Select";
import useForm from "@/hooks/useForm";
import { EMPTY_PERSON, STAFF_ROLE_OPTIONS } from "@/constants/team.constants";
import { inviteStaff } from "@/services/team.service";
import { inviteStaffSchema, toPersonPayload } from "@/validations/team.schema";

const INITIAL_VALUES = { staffRole: null, person: EMPTY_PERSON };

const StaffInviteModal = ({ open, onClose, tournamentId, onInvited }) => {
  const { values, setValues, errors, setErrors, isSubmitting, handleChange, handleSubmit } =
    useForm(INITIAL_VALUES, inviteStaffSchema);

  const handleClose = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    const res = await inviteStaff(tournamentId, {
      staffRole: data.staffRole,
      person: toPersonPayload(data.person),
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
      title="Invite scorer or media operator"
      submitText="Send invite"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      size="lg"
    >
      <Select
        name="staffRole"
        label="Role"
        required
        options={STAFF_ROLE_OPTIONS}
        value={values.staffRole}
        onChange={handleChange}
        error={errors.staffRole}
      />
      <PersonField
        label="Person"
        value={values.person}
        onChange={(person) => handleChange("person", person)}
        errors={errors}
      />
    </FormModal>
  );
};

export default StaffInviteModal;
