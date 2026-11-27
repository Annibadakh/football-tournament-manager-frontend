import PlayerLink from "@/components/profile/PlayerLink";
import { BadgeCheck, Crown } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { MEMBER_STATUS } from "@/constants/team.constants";

/**
 * Squad rows: jersey, player, position and badges. renderActions(member) adds captain controls.
 */
const SquadList = ({ members, renderActions }) => (
  <ul className="flex flex-col divide-y divide-line">
    {members.map((member) => (
      <li key={member.id} className="flex items-center gap-3 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 font-brand text-lg font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
          {member.jerseyNumber}
        </span>
        <Avatar src={member.player.photoUrl} name={member.player.fullName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 font-semibold text-fg">
            <PlayerLink player={member.player} className="truncate" />
            {member.player.isVerified && (
              <BadgeCheck
                className="size-4 text-brand-600 dark:text-brand-400"
                aria-label="Verified"
              />
            )}
            {member.isCaptain && (
              <Badge variant="accent" size="sm" icon={<Crown className="size-3" />}>
                Captain
              </Badge>
            )}
            {!member.player.isVerified && <Badge size="sm">Guest</Badge>}
            {member.status === MEMBER_STATUS.INVITED && (
              <Badge variant="warning" size="sm">
                Invite pending
              </Badge>
            )}
          </p>
          <p className="text-xs text-fg-muted">{member.position?.name}</p>
        </div>
        {renderActions?.(member)}
      </li>
    ))}
  </ul>
);

export default SquadList;
