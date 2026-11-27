import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, UserX } from "lucide-react";
import AwardsList from "@/components/profile/AwardsList";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";
import ShareButton from "@/components/ui/ShareButton";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { getPlayerProfile } from "@/services/profile.service";

const STAT_TILES = [
  ["matches", "Matches"],
  ["wins", "Wins"],
  ["goals", "Goals"],
  ["assists", "Assists"],
  ["potm", "Player of the Match"],
];

const StatTile = ({ label, value }) => (
  <div className="rounded-xl border border-line bg-surface p-3 text-center">
    <p className="font-brand text-3xl font-extrabold text-fg tabular-nums">{value}</p>
    <p className="text-xs text-fg-muted">{label}</p>
  </div>
);

// Public player profile: details (no contact info), career stats, history and awards
const PlayerProfilePage = () => {
  const { playerId } = useParams();
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    getPlayerProfile(playerId, { errorToast: false }).then((res) =>
      setProfile(res.ok ? res.data : null),
    );
  }, [playerId]);

  if (profile === undefined) return <PageLoader label="Loading player..." />;
  if (!profile)
    return (
      <EmptyState
        icon={UserX}
        title="Player not found"
        description="Only verified players have a public profile."
        className="min-h-[60vh]"
      />
    );

  const { totals } = profile;
  const details = [profile.age && `${profile.age} yrs`, profile.city?.name].filter(Boolean);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar
          src={profile.photoUrl}
          name={profile.fullName}
          size="xl"
          className="size-24 text-2xl"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl leading-tight text-fg">{profile.fullName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
            {details.length > 0 && (
              <span className="inline-flex items-center gap-1">
                {profile.city && <MapPin className="size-4" aria-hidden="true" />}
                {details.join(" · ")}
              </span>
            )}
            {profile.positions.map((position) => (
              <Badge key={position.id} size="sm" variant={position.isPrimary ? "brand" : "neutral"}>
                {position.name}
              </Badge>
            ))}
          </div>
          {profile.bio && <p className="mt-2 text-sm text-fg">{profile.bio}</p>}
        </div>
        <ShareButton title={`${profile.fullName} on Maidaan`} className="self-start" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STAT_TILES.map(([key, label]) => (
          <StatTile key={key} label={label} value={totals[key]} />
        ))}
      </div>
      <p className="-mt-3 text-xs text-fg-muted">
        Record {totals.wins}W · {totals.draws}D · {totals.losses}L. A squad member counts as playing
        every completed match of their team.
      </p>

      {profile.awards.length > 0 && (
        <Card title="Awards" subtitle={`${profile.awards.length} won`}>
          <AwardsList awards={profile.awards} show="tournament" />
        </Card>
      )}

      <Card
        title="Tournaments"
        subtitle={
          profile.history.length
            ? `${profile.history.length} ${profile.history.length === 1 ? "team" : "teams"}`
            : undefined
        }
      >
        {profile.history.length === 0 ? (
          <p className="text-sm text-fg-muted">No tournaments yet.</p>
        ) : (
          <div>
            <table className="w-full text-sm">
              <thead className="text-xs text-fg-muted">
                <tr className="border-b border-line">
                  <th className="py-2 text-left">Tournament · team</th>
                  <th className="hidden px-1.5 py-2 text-center sm:table-cell" title="Matches">
                    M
                  </th>
                  <th className="hidden px-1.5 py-2 text-center sm:table-cell" title="Wins">
                    W
                  </th>
                  <th className="hidden px-1.5 py-2 text-center sm:table-cell" title="Goals">
                    G
                  </th>
                  <th className="hidden px-1.5 py-2 text-center sm:table-cell" title="Assists">
                    A
                  </th>
                  <th
                    className="hidden px-1.5 py-2 text-center sm:table-cell"
                    title="Player of the Match"
                  >
                    POTM
                  </th>
                </tr>
              </thead>
              <tbody>
                {profile.history.map((row) => (
                  <tr key={`${row.team.id}`} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-2">
                      <Link
                        to={buildPath(ROUTES.TOURNAMENT, { tournamentId: row.tournament.slug })}
                        className="font-semibold text-fg hover:underline"
                      >
                        {row.tournament.name}
                      </Link>
                      <span className="block text-xs text-fg-muted">
                        <Link
                          to={buildPath(ROUTES.TEAM, { teamId: row.team.id })}
                          className="hover:underline"
                        >
                          {row.team.name}
                        </Link>
                        {row.position && ` · ${row.position.name}`}
                        {row.jerseyNumber && ` · #${row.jerseyNumber}`}
                        {row.isCaptain && " · Captain"}
                      </span>
                      {/* Phones: stats as one line instead of columns */}
                      <span className="mt-1 block text-xs font-semibold text-fg sm:hidden">
                        {row.stats.matches} M · {row.stats.wins} W · {row.stats.goals} G ·{" "}
                        {row.stats.assists} A · {row.stats.potm} POTM
                      </span>
                    </td>
                    {["matches", "wins", "goals", "assists", "potm"].map((key) => (
                      <td
                        key={key}
                        className="hidden px-1.5 py-2.5 text-center tabular-nums sm:table-cell"
                      >
                        {row.stats[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PlayerProfilePage;
