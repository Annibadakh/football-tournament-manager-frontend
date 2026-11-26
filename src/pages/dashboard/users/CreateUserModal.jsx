import { Mail, UserRound } from "lucide-react";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import useForm from "@/hooks/useForm";
import { ACCOUNT_ROLE_LABEL, CREATABLE_ROLES_BY_ROLE } from "@/constants/user.constants";
import { createUser } from "@/services/user.service";
import { createStaffUserSchema } from "@/validations/user.schema";

const FORM_ID = "create-user-form";

const CreateUserModal = ({ open, onClose, onCreated, actorRole }) => {
  const roleOptions = (CREATABLE_ROLES_BY_ROLE[actorRole] ?? []).map((role) => ({
    label: ACCOUNT_ROLE_LABEL[role],
    value: role,
  }));
  const initialValues = {
    fullName: "",
    email: "",
    accountRole: roleOptions.length === 1 ? roleOptions[0].value : null,
  };
  const { values, setValues, errors, setErrors, isSubmitting, handleChange, handleSubmit } =
    useForm(initialValues, createStaffUserSchema);

  const handleClose = () => {
    setValues(initialValues);
    setErrors({});
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    const res = await createUser(data);
    if (res.ok) {
      onCreated(res.data);
      handleClose();
    }
    return res;
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Invite a new account"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={isSubmitting}>
            Send invite
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <p className="text-sm text-fg-muted">
          They&apos;ll get an email to set their password and mobile number. The link is valid for 7
          days.
        </p>
        <FormInput
          name="fullName"
          label="Full name"
          required
          value={values.fullName}
          onChange={handleChange}
          error={errors.fullName}
          startIcon={<UserRound className="size-4" />}
        />
        <FormInput
          name="email"
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          startIcon={<Mail className="size-4" />}
        />
        <Select
          name="accountRole"
          label="Role"
          required
          options={roleOptions}
          value={values.accountRole}
          onChange={handleChange}
          error={errors.accountRole}
        />
      </form>
    </Modal>
  );
};

export default CreateUserModal;
