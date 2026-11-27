import { useEffect, useState } from "react";
import AwardsList from "@/components/profile/AwardsList";
import PlayerLink from "@/components/profile/PlayerLink";
import Card from "@/components/ui/Card";
import { getTeamStats } from "@/services/profile.service";

const ordinal = (n) => `${n}${["th", "st", "nd", "rd"][((n % 100) >> 3) ^ 1 && n % 10] || "th"}`;

// Record, table position, top scorers and awards; hidden until the team has played
const TeamStatsCard = ({ teamId }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    getTeamStats(teamId, { errorToast: false }).then((res) => {
      if (isCurrent && res.ok) setStats(res.data);
    });
    return () => {
      isCurrent = false;
    };
  }, [teamId]);

  if (!stats || (stats.record.played === 0 && !stats.awards.length)) return null;
  const { record, table } = stats;
  const tiles = [
    ["Played", record.played],
    ["Won", record.won],
    ["Drawn", record.drawn],
    ["Lost", record.lost],
    ["Goals", `${record.goalsFor}–${record.goalsAgainst}`],
  ];

  return (
    <Card
      title="Team stats"
      subtitle={
        table
          ? `${ordinal(table.position)} of ${table.teamsInTable}${table.group ? ` in Group ${table.group.name}` : ""} · ${table.points} pts`
          : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-5 gap-2">
          {tiles.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-surface-muted p-2 text-center">
              <p className="font-brand text-xl font-bold text-fg tabular-nums">{value}</p>
              <p className="text-[11px] text-fg-muted">{label}</p>
            </div>
          ))}
        </div>
        {stats.topScorers.length > 0 && (
          <div>
            <h3 className="mb-1 text-sm font-semibold text-fg">Top scorers</h3>
            <ol className="flex flex-col gap-1 text-sm">
              {stats.topScorers.map((entry) => (
                <li key={entry.player.id} className="flex justify-between">
                  <PlayerLink player={entry.player} className="text-fg" />
                  <span className="font-semibold tabular-nums">{entry.goals}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {stats.awards.length > 0 && <AwardsList awards={stats.awards} />}
      </div>
    </Card>
  );
};

export default TeamStatsCard;
