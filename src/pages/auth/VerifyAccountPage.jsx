import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound } from "lucide-react";
import AuthCard from "@/components/layout/AuthCard";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import PhoneInput from "@/components/ui/PhoneInput";
import useCountdown from "@/hooks/useCountdown";
import useForm from "@/hooks/useForm";
import { ROUTES } from "@/constants/routes.constants";
import { USER_RULES } from "@/constants/user.constants";
import * as authService from "@/services/auth.service";
import { endSession } from "@/services/session";
import { selectCurrentUser, selectIsVerified, setUser } from "@/store/slices/authSlice";
import { verifyAccountSchema } from "@/validations/auth.schema";

// Sign-up just sent a code, so the resend button starts on cooldown
const VerifyAccountPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isVerified = useSelector(selectIsVerified);
  const { secondsLeft, restart } = useCountdown(USER_RULES.OTP_RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { otp: "", phone: user?.phone ?? "" },
    verifyAccountSchema,
  );

  if (isVerified) return <Navigate to={ROUTES.DASHBOARD} replace />;

  const onSubmit = handleSubmit(async (data) => {
    const res = await authService.verifyEmail(data);
    if (!res.ok) return res;
    dispatch(setUser(res.data));
    navigate(ROUTES.DASHBOARD, { replace: true });
    return res;
  });

  const handleResend = async () => {
    setIsResending(true);
    const res = await authService.sendEmailOtp();
    setIsResending(false);
    if (res.ok) restart(USER_RULES.OTP_RESEND_SECONDS);
  };

  const handleUseAnotherAccount = async () => {
    await endSession();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <AuthCard
      title="Verify your account"
      description={`We sent a ${USER_RULES.OTP_LENGTH}-digit code to ${user?.email}. Enter it with your mobile number to finish.`}
      footer={
        <button
          type="button"
          onClick={handleUseAnotherAccount}
          className="font-semibold text-link hover:underline"
        >
          Use a different account
        </button>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormInput
          name="otp"
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={USER_RULES.OTP_LENGTH}
          required
          value={values.otp}
          onChange={(name, value) => handleChange(name, value.replace(/\D/g, ""))}
          error={errors.otp}
          startIcon={<KeyRound className="size-4" />}
          className="[&_input]:tracking-[0.4em]"
        />
        <PhoneInput required value={values.phone} onChange={handleChange} error={errors.phone} />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Verify and continue
        </Button>
        <Button
          variant="ghost"
          onClick={handleResend}
          loading={isResending}
          disabled={secondsLeft > 0}
        >
          {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
        </Button>
      </form>
    </AuthCard>
  );
};

export default VerifyAccountPage;
