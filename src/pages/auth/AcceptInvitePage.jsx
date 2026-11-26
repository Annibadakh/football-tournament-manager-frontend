import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { LinkIcon, UserRound } from "lucide-react";
import AuthCard from "@/components/layout/AuthCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import FormInput from "@/components/ui/FormInput";
import PageLoader from "@/components/ui/PageLoader";
import PhoneInput from "@/components/ui/PhoneInput";
import useForm from "@/hooks/useForm";
import { INVITE_TYPE } from "@/constants/invite.constants";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { ACCOUNT_ROLE_LABEL, PASSWORD_HINT } from "@/constants/user.constants";
import * as inviteService from "@/services/invite.service";
import { startSession } from "@/services/session";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { acceptInviteSchema } from "@/validations/auth.schema";

// What the invite is for, in one line
const describeInvite = (invite) => {
  const { context } = invite;
  if (invite.type === INVITE_TYPE.TEAM_JOIN && context) {
    return {
      title: `Join ${context.teamName}`,
      detail: `${context.tournament.name} · ${context.position} · jersey #${context.jerseyNumber}`,
      badge: "Player",
    };
  }
  if (invite.type === INVITE_TYPE.STAFF_ASSIGN && context) {
    return {
      title: `${context.roleLabel} for ${context.tournament.name}`,
      detail: "Tournament staff",
      badge: context.roleLabel,
    };
  }
  return {
    title: "Set up your account",
    detail: "",
    badge: ACCOUNT_ROLE_LABEL[invite.accountRole],
  };
};

// After accepting, take players to their team page; everyone else to the dashboard
const destinationAfterAccept = (invite) =>
  invite.type === INVITE_TYPE.TEAM_JOIN && invite.context
    ? buildPath(ROUTES.TEAM, { teamId: invite.context.teamId })
    : ROUTES.DASHBOARD;

// Guests (no password yet): set up the account and accept in one step
const AccountSetupForm = ({ token, invite }) => {
  const navigate = useNavigate();
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { fullName: invite.fullName, password: "", confirmPassword: "", phone: "" },
    acceptInviteSchema,
  );

  const onSubmit = handleSubmit(async ({ fullName, password, phone }) => {
    const res = await inviteService.acceptInvite(token, { fullName, password, phone });
    if (!res.ok) return res;
    startSession(res.data);
    navigate(destinationAfterAccept(invite), { replace: true });
    return res;
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
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
        {invite.type === INVITE_TYPE.ACCOUNT_SETUP
          ? "Activate my account"
          : "Activate account and accept"}
      </Button>
    </form>
  );
};

// Existing accounts: must be logged in as the invitee to accept; declining only needs the link
const RespondButtons = ({ token, invite }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const [busy, setBusy] = useState(null);
  const isInvitee = user?.email === invite.email;

  const respond = async (accept) => {
    setBusy(accept ? "accept" : "decline");
    const res = accept
      ? await inviteService.acceptInvite(token)
      : await inviteService.declineInvite(token);
    setBusy(null);
    if (res.ok) navigate(accept ? destinationAfterAccept(invite) : ROUTES.HOME, { replace: true });
  };

  return (
    <div className="flex flex-col gap-3">
      {isInvitee && (
        <Button size="lg" fullWidth loading={busy === "accept"} onClick={() => respond(true)}>
          Accept invitation
        </Button>
      )}
      {!user && (
        <Link
          to={ROUTES.LOGIN}
          state={{ from: location }}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-brand-600 font-semibold text-white hover:bg-brand-700"
        >
          Log in to accept
        </Link>
      )}
      {user && !isInvitee && (
        <p className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-fg">
          You&apos;re logged in as {user.email}. Log in as {invite.email} to accept this invitation.
        </p>
      )}
      <Button variant="ghost" fullWidth loading={busy === "decline"} onClick={() => respond(false)}>
        Decline
      </Button>
    </div>
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

  const { invite } = state;
  const { title, detail, badge } = describeInvite(invite);

  return (
    <AuthCard
      title={title}
      description={`${invite.invitedBy ?? "Maidaan"} invited you.${detail ? ` ${detail}` : ""}`}
    >
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-sm">
        <span className="text-fg-muted">{invite.email}</span>
        <Badge variant="brand" size="sm">
          {badge}
        </Badge>
      </div>
      {invite.needsAccountSetup ? (
        <AccountSetupForm token={token} invite={invite} />
      ) : (
        <RespondButtons token={token} invite={invite} />
      )}
    </AuthCard>
  );
};

export default AcceptInvitePage;
