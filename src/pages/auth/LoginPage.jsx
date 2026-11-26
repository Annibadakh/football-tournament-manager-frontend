import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Mail } from "lucide-react";
import AuthCard from "@/components/layout/AuthCard";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import useForm from "@/hooks/useForm";
import { ROUTES } from "@/constants/routes.constants";
import { ACCOUNT_STATUS } from "@/constants/user.constants";
import * as authService from "@/services/auth.service";
import { startSession } from "@/services/session";
import { loginSchema } from "@/validations/auth.schema";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { email: "", password: "" },
    loginSchema,
  );

  const onSubmit = handleSubmit(async (data) => {
    const res = await authService.login(data);
    if (!res.ok) return res;
    startSession(res.data);
    // Unverified accounts finish verification first; others return to where they were headed
    const isVerified = res.data.user.accountStatus === ACCOUNT_STATUS.VERIFIED;
    navigate(
      isVerified ? (location.state?.from?.pathname ?? ROUTES.DASHBOARD) : ROUTES.VERIFY_ACCOUNT,
      {
        replace: true,
      },
    );
    return res;
  });

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to manage your tournaments, teams and profile."
      footer={
        <>
          New to Maidaan?{" "}
          <Link to={ROUTES.SIGNUP} className="font-semibold text-link hover:underline">
            Create an account
          </Link>
        </>
      }
    >
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
        <FormInput
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Link
          to={ROUTES.FORGOT_PASSWORD}
          className="self-end text-sm font-semibold text-link hover:underline"
        >
          Forgot password?
        </Link>
        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          startIcon={<LogIn className="size-4" />}
        >
          Log in
        </Button>
      </form>
    </AuthCard>
  );
};

export default LoginPage;
