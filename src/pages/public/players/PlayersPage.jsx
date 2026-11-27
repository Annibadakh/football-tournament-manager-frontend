import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Users } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import PlaceSearch from "@/components/ui/PlaceSearch";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import { PLACE_SEARCH_TYPE } from "@/constants/place.constants";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import usePositions from "@/hooks/usePositions";
import { searchPlayerDirectory } from "@/services/profile.service";

const PAGE_SIZE = 12;

const PlayerCard = ({ player }) => (
  <Link
    to={buildPath(ROUTES.PLAYER, { playerId: player.id })}
    className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-sm transition-colors hover:border-brand-400"
  >
    <Avatar src={player.photoUrl} name={player.fullName} size="md" />
    <span className="min-w-0">
      <span className="block truncate font-semibold text-fg">{player.fullName}</span>
      <span className="block truncate text-xs text-fg-muted">
        {player.positions.map((position) => position.shortName).join(" · ") || "No position yet"}
      </span>
      {player.city && (
        <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-fg-muted">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          {player.city.name}
        </span>
      )}
    </span>
  </Link>
);

// Public directory of verified players: name search, city and position filters
const PlayersPage = () => {
  const positions = usePositions();
  const [filters, setFilters] = useState({ search: "", city: null, positionId: null, page: 1 });
  const [result, setResult] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    searchPlayerDirectory(
      {
        page: filters.page,
        pageSize: PAGE_SIZE,
        ...(filters.search && { search: filters.search }),
        ...(filters.city && { cityId: filters.city.id }),
        ...(filters.positionId && { positionId: filters.positionId }),
      },
      { errorToast: false },
    ).then((res) => {
      if (isCurrent)
        setResult(res.ok ? { items: res.data, total: res.meta.total } : { items: [], total: 0 });
    });
    return () => {
      isCurrent = false;
    };
  }, [filters]);

  const update = (changes) =>
    setFilters((current) => ({ ...current, ...changes, page: changes.page ?? 1 }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-3xl text-fg">Players</h1>
        <p className="mt-1 text-fg-muted">
          Verified footballers on Maidaan. Contact details are never shown.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <SearchInput
          placeholder="Search by name"
          aria-label="Search players by name"
          onSearch={(search) => update({ search })}
        />
        <PlaceSearch
          name="city"
          type={PLACE_SEARCH_TYPE.CITY}
          placeholder="Any city"
          ariaLabel="Filter by city"
          value={filters.city}
          onChange={(_, city) => update({ city })}
        />
        <Select
          name="positionId"
          ariaLabel="Filter by position"
          placeholder="Any position"
          clearable
          options={positions.map((position) => ({ label: position.name, value: position.id }))}
          value={filters.positionId}
          onChange={(_, positionId) => update({ positionId })}
        />
      </div>
      {!result && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}
      {result?.items.length === 0 && (
        <EmptyState
          icon={Users}
          title="No players found"
          description="Try another name, city or position."
        />
      )}
      {result?.items.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
          <Pagination
            page={filters.page}
            pageSize={PAGE_SIZE}
            total={result.total}
            onPageChange={(page) => update({ page })}
            pageSizeOptions={[PAGE_SIZE]}
          />
        </>
      )}
    </div>
  );
};

export default PlayersPage;
