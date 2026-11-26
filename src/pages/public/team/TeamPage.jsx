import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Lock,
  MailPlus,
  Pencil,
  RotateCw,
  ShieldCheck,
  Trash2,
  Unlock,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import EditPlayerModal from "@/components/team/EditPlayerModal";
import InvitePlayerModal from "@/components/team/InvitePlayerModal";
import RejectRequestModal from "@/components/team/RejectRequestModal";
import SquadList from "@/components/team/SquadList";
import TeamStatusBadge from "@/components/team/TeamStatusBadge";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import {
  MEMBER_STATUS,
  REVIEW_DECISION,
  TEAM_STATUS,
  VIEWER_ROLE,
} from "@/constants/team.constants";
import useViewerKey from "@/hooks/useViewerKey";
import * as teamService from "@/services/team.service";

const STATUS_NOTES = {
  [TEAM_STATUS.PENDING_APPROVAL]: "Waiting for the organizer to review this request.",
  [TEAM_STATUS.AWAITING_PAYMENT]:
    "Approved. The team is confirmed once the entry fee is paid or the organizer confirms it.",
  [TEAM_STATUS.REJECTED]: "This request was not approved.",
  [TEAM_STATUS.WITHDRAWN]: "The captain withdrew this team.",
  [TEAM_STATUS.REMOVED]: "The organizer removed this team from the tournament.",
};

const SquadProgress = ({ team }) => {
  const { minSquadSize, maxSquadSize } = team.tournament;
  return (
    <>
      <span className="font-semibold text-fg">{team.squadCount}</span>{" "}
      {team.squadCount === 1 ? "player" : "players"} joined
      {minSquadSize && ` · needs ${minSquadSize}–${maxSquadSize} to be locked`}
    </>
  );
};

const TeamPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(undefined);
  const [reloadCount, setReloadCount] = useState(0);
  const [modal, setModal] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  const viewerKey = useViewerKey();

  // The response depends on who is viewing, so wait for the session before loading
  useEffect(() => {
    if (!viewerKey) return undefined;
    let isCurrent = true;
    teamService.getTeam(teamId, { errorToast: false }).then((res) => {
      if (isCurrent) setTeam(res.ok ? res.data : null);
    });
    return () => {
      isCurrent = false;
    };
  }, [teamId, reloadCount, viewerKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  const runAction = async (action, { onSuccess = reload } = {}) => {
    setIsBusy(true);
    const res = await action();
    setIsBusy(false);
    setConfirmAction(null);
    if (res.ok) onSuccess();
  };

  if (team === undefined) return <PageLoader label="Loading team..." />;
  if (!team) {
    return (
      <EmptyState
        icon={Users}
        title="Team not found"
        description="It may not be confirmed yet or was removed."
        action={
          <Link to={ROUTES.TOURNAMENTS} className="font-semibold text-link hover:underline">
            Browse tournaments
          </Link>
        }
        className="min-h-[60vh]"
      />
    );
  }

  const isCaptain = team.viewerRole === VIEWER_ROLE.CAPTAIN;
  const isManager = team.viewerRole === VIEWER_ROLE.MANAGER;
  const canEditSquad = isCaptain && team.status === TEAM_STATUS.CONFIRMED && !team.isSquadLocked;
  const canWithdraw =
    isCaptain && [TEAM_STATUS.PENDING_APPROVAL, TEAM_STATUS.AWAITING_PAYMENT].includes(team.status);
  const isLive = [
    TEAM_STATUS.PENDING_APPROVAL,
    TEAM_STATUS.AWAITING_PAYMENT,
    TEAM_STATUS.CONFIRMED,
  ].includes(team.status);

  const confirmations = {
    withdraw: {
      title: "Withdraw this team?",
      message: "Your request or registration is cancelled.",
      confirmText: "Withdraw",
      run: () =>
        runAction(() => teamService.withdrawTeam(team.id), {
          onSuccess: () => navigate(ROUTES.DASHBOARD),
        }),
    },
    remove: {
      title: `Remove ${team.name}?`,
      message: "The team and its squad are removed from this tournament.",
      confirmText: "Remove team",
      run: () => runAction(() => teamService.removeTeam(team.id)),
    },
    approve: {
      title: `Approve ${team.name}?`,
      message: "The team joins the tournament.",
      confirmText: "Approve",
      variant: "primary",
      run: () =>
        runAction(() => teamService.reviewTeam(team.id, { decision: REVIEW_DECISION.APPROVE })),
    },
    confirm: {
      title: "Confirm this team?",
      message: "Use this when the entry fee was paid offline.",
      confirmText: "Confirm team",
      variant: "primary",
      run: () => runAction(() => teamService.confirmTeam(team.id)),
    },
  };
  const pending = confirmAction && confirmations[confirmAction.type];

  const renderMemberActions = (member) =>
    canEditSquad && (
      <div className="flex shrink-0 gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="px-2"
          aria-label={`Edit ${member.player.fullName}`}
          onClick={() => setModal({ type: "edit", member })}
          startIcon={<Pencil className="size-4" />}
        />
        {member.status === MEMBER_STATUS.INVITED && (
          <Button
            size="sm"
            variant="ghost"
            className="px-2"
            aria-label={`Resend invite to ${member.player.fullName}`}
            onClick={() => runAction(() => teamService.resendPlayerInvite(team.id, member.id))}
            startIcon={<RotateCw className="size-4" />}
          />
        )}
        {!member.isCaptain && (
          <Button
            size="sm"
            variant="ghost"
            className="px-2 text-danger"
            aria-label={`${member.status === MEMBER_STATUS.INVITED ? "Cancel invite for" : "Remove"} ${member.player.fullName}`}
            onClick={() => runAction(() => teamService.removePlayer(team.id, member.id))}
            startIcon={
              member.status === MEMBER_STATUS.INVITED ? (
                <X className="size-4" />
              ) : (
                <Trash2 className="size-4" />
              )
            }
          />
        )}
      </div>
    );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-700 font-brand text-xl font-extrabold text-white">
            {team.shortName}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl leading-tight text-fg">{team.name}</h1>
              <TeamStatusBadge status={team.status} />
              {team.isSquadLocked && (
                <Badge size="sm" icon={<Lock className="size-3" />}>
                  Locked
                </Badge>
              )}
            </div>
            <Link
              to={buildPath(ROUTES.TOURNAMENT, { tournamentId: team.tournament.slug })}
              className="text-sm font-semibold text-link hover:underline"
            >
              {team.tournament.name}
            </Link>
          </div>
        </div>
        {isManager && isLive && (
          <div className="flex flex-wrap gap-2">
            {team.status === TEAM_STATUS.PENDING_APPROVAL && (
              <>
                <Button onClick={() => setConfirmAction({ type: "approve" })}>Approve</Button>
                <Button variant="ghost" onClick={() => setModal({ type: "reject" })}>
                  Reject
                </Button>
              </>
            )}
            {team.status === TEAM_STATUS.AWAITING_PAYMENT && (
              <Button
                onClick={() => setConfirmAction({ type: "confirm" })}
                startIcon={<ShieldCheck className="size-4" />}
              >
                Confirm team
              </Button>
            )}
            {team.status === TEAM_STATUS.CONFIRMED && (
              <Button
                variant={team.isSquadLocked ? "outline" : "primary"}
                loading={isBusy}
                onClick={() =>
                  runAction(() => teamService.setTeamLock(team.id, !team.isSquadLocked))
                }
                startIcon={
                  team.isSquadLocked ? <Unlock className="size-4" /> : <Lock className="size-4" />
                }
              >
                {team.isSquadLocked ? "Unlock squad" : "Lock squad"}
              </Button>
            )}
            <Button
              variant="ghost"
              className="text-danger"
              onClick={() => setConfirmAction({ type: "remove" })}
            >
              Remove
            </Button>
          </div>
        )}
        {canWithdraw && (
          <Button
            variant="ghost"
            className="text-danger"
            onClick={() => setConfirmAction({ type: "withdraw" })}
          >
            Withdraw
          </Button>
        )}
      </div>

      {STATUS_NOTES[team.status] && team.viewerRole !== VIEWER_ROLE.PUBLIC && (
        <div className="rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-fg">
          {STATUS_NOTES[team.status]}
          {team.rejectionReason && (
            <p className="mt-1 text-fg-muted">Reason: {team.rejectionReason}</p>
          )}
        </div>
      )}

      <Card
        title="Squad"
        subtitle={<SquadProgress team={team} />}
        actions={
          canEditSquad && (
            <Button
              size="sm"
              onClick={() => setModal({ type: "invite" })}
              startIcon={<UserPlus className="size-4" />}
            >
              Invite player
            </Button>
          )
        }
      >
        {team.isSquadLocked && (
          <p className="mb-2 flex items-center gap-2 text-sm text-fg-muted">
            <Lock className="size-4" aria-hidden="true" /> Squad locked by the organizer
          </p>
        )}
        {isCaptain && team.status === TEAM_STATUS.CONFIRMED && team.members.length === 1 && (
          <p className="mb-2 flex items-center gap-2 text-sm text-fg-muted">
            <MailPlus className="size-4" aria-hidden="true" /> Invite your players. They join once
            they accept the email or in-app invitation.
          </p>
        )}
        <SquadList members={team.members} renderActions={renderMemberActions} />
      </Card>

      {modal?.type === "invite" && (
        <InvitePlayerModal
          open
          onClose={() => setModal(null)}
          teamId={team.id}
          onInvited={reload}
        />
      )}
      {modal?.type === "edit" && (
        <EditPlayerModal
          teamId={team.id}
          member={modal.member}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            reload();
          }}
        />
      )}
      {modal?.type === "reject" && (
        <RejectRequestModal
          team={team}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            reload();
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setConfirmAction(null)}
        onConfirm={pending?.run}
        loading={isBusy}
        title={pending?.title}
        message={pending?.message}
        confirmText={pending?.confirmText}
        variant={pending?.variant ?? "danger"}
      />
    </div>
  );
};

export default TeamPage;
