import { Link, useNavigate } from "react-router-dom";
import { Mail, UserRound } from "lucide-react";
import AuthCard from "@/components/layout/AuthCard";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import useForm from "@/hooks/useForm";
import { ROUTES } from "@/constants/routes.constants";
import * as authService from "@/services/auth.service";
import { startSession } from "@/services/session";
import { signupSchema } from "@/validations/auth.schema";
import { PASSWORD_HINT } from "@/constants/user.constants";

const INITIAL_VALUES = { fullName: "", email: "", password: "", confirmPassword: "" };

const SignupPage = () => {
  const navigate = useNavigate();
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    INITIAL_VALUES,
    signupSchema,
  );

  const onSubmit = handleSubmit(async ({ fullName, email, password }) => {
    const res = await authService.register({ fullName, email, password });
    if (!res.ok) return res;
    startSession(res.data);
    navigate(ROUTES.VERIFY_ACCOUNT, { replace: true });
    return res;
  });

  return (
    <AuthCard
      title="Create your account"
      description="Your player profile works across every tournament and team."
      footer={
        <>
          Already have an account?{" "}
          <Link to={ROUTES.LOGIN} className="font-semibold text-link hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormInput
          name="fullName"
          label="Full name"
          autoComplete="name"
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
          autoComplete="new-password"
          required
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          helperText={PASSWORD_HINT}
        />
        <FormInput
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
};

export default SignupPage;
