import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Users } from "lucide-react";
import TeamStatusBadge from "@/components/team/TeamStatusBadge";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { MEMBER_STATUS } from "@/constants/team.constants";
import { listMyTeams } from "@/services/team.service";

const MyTeamsCard = ({ reloadKey }) => {
  const [memberships, setMemberships] = useState(null);

  useEffect(() => {
    listMyTeams().then((res) => setMemberships(res.ok ? res.data : []));
  }, [reloadKey]);

  const activeMemberships = memberships?.filter(
    (membership) => membership.membershipStatus === MEMBER_STATUS.ACTIVE,
  );

  return (
    <Card title="My teams">
      {!memberships && <Skeleton className="h-20 w-full rounded-xl" />}
      {activeMemberships?.length === 0 && (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Register a team from a tournament page, or accept a captain's invitation."
          action={
            <Link to={ROUTES.TOURNAMENTS} className="font-semibold text-link hover:underline">
              Browse tournaments
            </Link>
          }
        />
      )}
      {activeMemberships?.length > 0 && (
        <ul className="flex flex-col gap-2">
          {activeMemberships.map((membership) => (
            <li key={membership.membershipId}>
              <Link
                to={buildPath(ROUTES.TEAM, { teamId: membership.team.id })}
                className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 hover:bg-surface-muted"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white">
                  {membership.team.shortName}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5 font-semibold text-fg">
                    {membership.team.name}
                    {membership.isCaptain && (
                      <Badge variant="accent" size="sm" icon={<Crown className="size-3" />}>
                        Captain
                      </Badge>
                    )}
                  </span>
                  <span className="block truncate text-xs text-fg-muted">
                    {membership.tournament.name} · #{membership.jerseyNumber} ·{" "}
                    {membership.position?.name}
                  </span>
                </span>
                <TeamStatusBadge status={membership.team.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default MyTeamsCard;
