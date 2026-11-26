import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LinkIcon, UserRound } from "lucide-react";
import AuthCard from "@/components/layout/AuthCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import FormInput from "@/components/ui/FormInput";
import PageLoader from "@/components/ui/PageLoader";
import PhoneInput from "@/components/ui/PhoneInput";
import useForm from "@/hooks/useForm";
import { ROUTES } from "@/constants/routes.constants";
import { ACCOUNT_ROLE_LABEL } from "@/constants/user.constants";
import * as inviteService from "@/services/invite.service";
import { startSession } from "@/services/session";
import { acceptInviteSchema } from "@/validations/auth.schema";
import { PASSWORD_HINT } from "@/constants/user.constants";

const InviteForm = ({ token, invite }) => {
  const navigate = useNavigate();
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { fullName: invite.fullName, password: "", confirmPassword: "", phone: "" },
    acceptInviteSchema,
  );

  const onSubmit = handleSubmit(async ({ fullName, password, phone }) => {
    const res = await inviteService.acceptInvite(token, { fullName, password, phone });
    if (!res.ok) return res;
    startSession(res.data);
    navigate(ROUTES.DASHBOARD, { replace: true });
    return res;
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-sm">
        <span className="text-fg-muted">{invite.email}</span>
        <Badge variant="brand" size="sm">
          {ACCOUNT_ROLE_LABEL[invite.accountRole]}
        </Badge>
      </div>
      <FormInput
        name="fullName"
        label="Full name"
        required
        value={values.fullName}
        onChange={handleChange}
        error={errors.fullName}
        startIcon={<UserRound className="size-4" />}
      />
      <PhoneInput required value={values.phone} onChange={handleChange} error={errors.phone} />
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
        Activate my account
      </Button>
    </form>
  );
};

const AcceptInvitePage = () => {
  const { token } = useParams();
  const [state, setState] = useState({ isLoading: true, invite: null });

  useEffect(() => {
    let isCurrent = true;
    inviteService.getInvite(token).then((res) => {
      if (isCurrent) setState({ isLoading: false, invite: res.ok ? res.data : null });
    });
    return () => {
      isCurrent = false;
    };
  }, [token]);

  if (state.isLoading) return <PageLoader label="Checking your invite..." />;

  if (!state.invite) {
    return (
      <EmptyState
        icon={LinkIcon}
        title="Invite link expired"
        description="This link is invalid, already used or expired. Ask the person who invited you to send a new one."
        action={
          <Link to={ROUTES.LOGIN} className="font-semibold text-link hover:underline">
            Go to log in
          </Link>
        }
      />
    );
  }

  return (
    <AuthCard
      title="Set up your account"
      description={`${state.invite.invitedBy ?? "Maidaan"} invited you to Maidaan. Set a password to activate your account.`}
    >
      <InviteForm token={token} invite={state.invite} />
    </AuthCard>
  );
};

export default AcceptInvitePage;
