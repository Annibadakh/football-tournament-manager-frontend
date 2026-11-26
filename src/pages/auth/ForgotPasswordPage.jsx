import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";
import AuthCard from "@/components/layout/AuthCard";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import useForm from "@/hooks/useForm";
import { ROUTES } from "@/constants/routes.constants";
import { USER_RULES } from "@/constants/user.constants";
import * as authService from "@/services/auth.service";
import { forgotPasswordSchema, resetPasswordSchema } from "@/validations/auth.schema";
import { PASSWORD_HINT } from "@/constants/user.constants";

const EmailStep = ({ onCodeSent }) => {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { email: "" },
    forgotPasswordSchema,
  );

  const onSubmit = handleSubmit(async (data) => {
    const res = await authService.requestPasswordReset(data);
    if (res.ok) onCodeSent(data.email);
    return res;
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormInput
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        startIcon={<Mail className="size-4" />}
      />
      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Send reset code
      </Button>
    </form>
  );
};

const ResetStep = ({ email }) => {
  const navigate = useNavigate();
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { otp: "", newPassword: "", confirmPassword: "" },
    resetPasswordSchema,
  );

  const onSubmit = handleSubmit(async ({ otp, newPassword }) => {
    const res = await authService.resetPassword({ email, otp, newPassword });
    if (res.ok) navigate(ROUTES.LOGIN, { replace: true });
    return res;
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormInput
        name="otp"
        label="Reset code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={USER_RULES.OTP_LENGTH}
        required
        value={values.otp}
        onChange={(name, value) => handleChange(name, value.replace(/\D/g, ""))}
        error={errors.otp}
        startIcon={<KeyRound className="size-4" />}
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
      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Set new password
      </Button>
    </form>
  );
};

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState(null);

  return (
    <AuthCard
      title={email ? "Enter your reset code" : "Forgot your password?"}
      description={
        email
          ? `If an account exists for ${email}, we sent a ${USER_RULES.OTP_LENGTH}-digit code to it.`
          : "Enter your email and we'll send you a code to reset your password."
      }
      footer={
        <Link to={ROUTES.LOGIN} className="font-semibold text-link hover:underline">
          Back to log in
        </Link>
      }
    >
      {email ? <ResetStep email={email} /> : <EmailStep onCodeSent={setEmail} />}
    </AuthCard>
  );
};

export default ForgotPasswordPage;
