import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Navigation, Users } from "lucide-react";
import logoIcon from "@/assets/brand/maidaan-icon.svg";
import TournamentStatusBadge from "@/components/tournament/TournamentStatusBadge";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { formatCategories, formatDateRange, formatEntryFee } from "@/utils/tournament";

const TournamentCard = ({ tournament }) => {
  const place = tournament.venue ?? tournament.city;
  const categories = formatCategories(tournament);

  return (
    <Link
      to={buildPath(ROUTES.TOURNAMENT, { tournamentId: tournament.slug })}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-28 bg-brand-700">
        {tournament.bannerUrl && (
          <img src={tournament.bannerUrl} alt="" className="size-full object-cover" />
        )}
        <div className="absolute top-3 right-3">
          <TournamentStatusBadge status={tournament.status} size="sm" />
        </div>
        <img
          src={tournament.logoUrl ?? logoIcon}
          alt=""
          className="absolute -bottom-6 left-4 size-14 rounded-xl border-4 border-surface bg-surface object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-8">
        <h3 className="line-clamp-2 text-lg leading-tight text-fg group-hover:text-link">
          {tournament.name}
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-fg-muted">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          {formatDateRange(tournament.startDate, tournament.endDate)}
        </p>
        {place && (
          <p className="flex items-center gap-1.5 text-sm text-fg-muted">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {place.name}
              {place.city && place.city !== place.name ? `, ${place.city}` : ""}
            </span>
            {tournament.distanceKm != null && (
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
                <Navigation className="size-3" aria-hidden="true" />
                {tournament.distanceKm} km
              </span>
            )}
          </p>
        )}
        {categories && <p className="text-xs text-fg-muted">{categories}</p>}
        <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-sm">
          <span className="font-semibold text-fg">{formatEntryFee(tournament.entryFee)}</span>
          {tournament.maxTeams && (
            <span className="flex items-center gap-1 text-fg-muted">
              <Users className="size-4" aria-hidden="true" /> Up to {tournament.maxTeams} teams
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TournamentCard;
