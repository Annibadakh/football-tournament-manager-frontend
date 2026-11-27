import { Link } from "react-router-dom";
import AwardIcon from "@/components/profile/AwardIcon";
import PlayerLink from "@/components/profile/PlayerLink";
import { awardLabel } from "@/constants/award.constants";
import { buildPath, ROUTES } from "@/constants/routes.constants";

/**
 * Awards with their winner. `show` picks the second line: "winner" (tournament page),
 * "tournament" (profile/team page). `renderActions` adds organizer buttons.
 */
const AwardsList = ({ awards, show = "winner", renderActions }) => (
  <ul className="grid gap-2 sm:grid-cols-2">
    {awards.map((award) => (
      <li key={award.id} className="flex items-center gap-3 rounded-xl border border-line p-2.5">
        <AwardIcon type={award.type} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{awardLabel(award)}</p>
          <p className="truncate text-xs text-fg-muted">
            {show === "tournament" && award.tournament ? (
              <Link
                to={buildPath(ROUTES.TOURNAMENT, { tournamentId: award.tournament.slug })}
                className="hover:underline"
              >
                {award.tournament.name}
              </Link>
            ) : award.player ? (
              <>
                <PlayerLink player={award.player} className="font-medium text-fg" />
                {award.team && ` · ${award.team.name}`}
              </>
            ) : (
              award.team && (
                <Link
                  to={buildPath(ROUTES.TEAM, { teamId: award.team.id })}
                  className="hover:underline"
                >
                  {award.team.name}
                </Link>
              )
            )}
          </p>
        </div>
        {renderActions?.(award)}
      </li>
    ))}
  </ul>
);

export default AwardsList;
