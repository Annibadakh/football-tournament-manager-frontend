import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import FormInput from "@/components/ui/FormInput";
import PageHeader from "@/components/ui/PageHeader";
import useForm from "@/hooks/useForm";
import { ROUTES } from "@/constants/routes.constants";
import { PASSWORD_HINT } from "@/constants/user.constants";
import { logoutAllDevices } from "@/services/auth.service";
import { changeMyPassword } from "@/services/me.service";
import { startSession } from "@/services/session";
import { changePasswordSchema } from "@/validations/user.schema";
import { clearSession } from "@/store/slices/authSlice";

const INITIAL_VALUES = { currentPassword: "", newPassword: "", confirmPassword: "" };

const ChangePasswordCard = () => {
  const { values, setValues, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    INITIAL_VALUES,
    changePasswordSchema,
  );

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    const res = await changeMyPassword({ currentPassword, newPassword });
    if (res.ok) {
      // The API signs out other devices and returns a fresh session for this one
      startSession(res.data);
      setValues(INITIAL_VALUES);
    }
    return res;
  });

  return (
    <Card title="Change password" subtitle="Changing it signs you out on all other devices">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormInput
          name="currentPassword"
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          value={values.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
        />
        <FormInput
          name="newPassword"
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          value={values.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          helperText={PASSWORD_HINT}
        />
        <FormInput
          name="confirmPassword"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
};

const SessionsCard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutAll = async () => {
    setIsLoggingOut(true);
    const res = await logoutAllDevices();
    setIsLoggingOut(false);
    if (!res.ok) return;
    dispatch(clearSession());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <Card
      title="Signed-in devices"
      subtitle="Lost a phone or used a shared computer? Sign out everywhere."
    >
      <Button
        variant="danger"
        onClick={() => setIsConfirmOpen(true)}
        startIcon={<LogOut className="size-4" />}
      >
        Log out of all devices
      </Button>
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleLogoutAll}
        loading={isLoggingOut}
        title="Log out of all devices?"
        message="You'll be signed out everywhere, including this browser."
        confirmText="Log out everywhere"
      />
    </Card>
  );
};

const SecurityPage = () => (
  <>
    <PageHeader title="Security" subtitle="Password and signed-in devices" />
    <div className="flex max-w-3xl flex-col gap-6">
      <ChangePasswordCard />
      <SessionsCard />
    </div>
  </>
);

export default SecurityPage;
