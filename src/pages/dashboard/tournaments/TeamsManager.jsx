import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Lock, Plus, X } from "lucide-react";
import AddTeamModal from "@/components/team/AddTeamModal";
import RejectRequestModal from "@/components/team/RejectRequestModal";
import TeamStatusBadge from "@/components/team/TeamStatusBadge";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { REVIEW_DECISION, TEAM_STATUS, TEAM_STATUS_OPTIONS } from "@/constants/team.constants";
import { listTournamentTeams, reviewTeam } from "@/services/team.service";

// Organizer view of every team and request in a tournament
const TeamsManager = ({ tournament }) => {
  const [teams, setTeams] = useState(null);
  const [status, setStatus] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    listTournamentTeams(tournament.slug, status ? { status } : {}).then((res) =>
      setTeams(res.ok ? res.data : []),
    );
  }, [tournament.slug, status, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  const slotCount =
    teams?.filter((team) =>
      [TEAM_STATUS.AWAITING_PAYMENT, TEAM_STATUS.CONFIRMED].includes(team.status),
    ).length ?? 0;

  const approve = async (team) => {
    setApprovingId(team.id);
    const res = await reviewTeam(team.id, { decision: REVIEW_DECISION.APPROVE });
    setApprovingId(null);
    if (res.ok) reload();
  };

  return (
    <Card
      title="Teams"
      subtitle={
        tournament.maxTeams
          ? `${slotCount} of ${tournament.maxTeams} team slots used${status ? " (filtered)" : ""}`
          : undefined
      }
      actions={
        <Button
          size="sm"
          onClick={() => setIsAddOpen(true)}
          startIcon={<Plus className="size-4" />}
        >
          Add team
        </Button>
      }
    >
      <Select
        name="status"
        placeholder="All statuses"
        clearable
        options={TEAM_STATUS_OPTIONS}
        value={status}
        onChange={(_, value) => setStatus(value)}
        className="mb-3 w-full sm:w-56"
      />
      {!teams && <Skeleton className="h-32 w-full rounded-xl" />}
      {teams?.length === 0 && (
        <EmptyState
          title="No teams yet"
          description="Add teams yourself, or wait for captains to send requests."
        />
      )}
      {teams?.length > 0 && (
        <ul className="flex flex-col divide-y divide-line">
          {teams.map((team) => (
            <li key={team.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white">
                {team.shortName}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  to={buildPath(ROUTES.TEAM, { teamId: team.id })}
                  className="font-semibold text-link hover:underline"
                >
                  {team.name}
                </Link>
                <p className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  <TeamStatusBadge status={team.status} />
                  {team.isSquadLocked && (
                    <Badge size="sm" icon={<Lock className="size-3" />}>
                      Locked
                    </Badge>
                  )}
                  Captain {team.captain?.fullName} · {team.squadCount} players
                  {team.requestNumber && ` · request ${team.requestNumber} of 2`}
                </p>
                {team.rejectionReason && (
                  <p className="text-xs text-fg-muted">Reason: {team.rejectionReason}</p>
                )}
              </div>
              {team.status === TEAM_STATUS.PENDING_APPROVAL && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    loading={approvingId === team.id}
                    onClick={() => approve(team)}
                    startIcon={<Check className="size-4" />}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger"
                    onClick={() => setRejecting(team)}
                    startIcon={<X className="size-4" />}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <AddTeamModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        tournamentId={tournament.slug}
        onAdded={reload}
      />
      {rejecting && (
        <RejectRequestModal
          team={rejecting}
          onClose={() => setRejecting(null)}
          onDone={() => {
            setRejecting(null);
            reload();
          }}
        />
      )}
    </Card>
  );
};

export default TeamsManager;
