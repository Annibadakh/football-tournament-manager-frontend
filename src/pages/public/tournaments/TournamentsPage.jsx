import { useEffect, useMemo, useState } from "react";
import { LocateFixed, LocateOff, Trophy } from "lucide-react";
import { toast } from "sonner";
import TournamentCard from "@/components/tournament/TournamentCard";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import useTournamentCategories from "@/hooks/useTournamentCategories";
import {
  DEFAULT_NEAR_ME_RADIUS_KM,
  NEAR_ME_RADIUS_OPTIONS,
  PUBLIC_STATUS_OPTIONS,
} from "@/constants/tournament.constants";
import { listTournaments } from "@/services/tournament.service";

const PAGE_SIZE = 12;
const INITIAL_FILTERS = {
  status: null,
  gameFormatId: null,
  ageGroupId: null,
  genderCategoryId: null,
};

// Asks the browser for the user's position once; nothing is stored
const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error("unsupported"));
    else
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        maximumAge: 300000,
      });
  });

const TournamentsPage = () => {
  const { gameFormatOptions, ageGroupOptions, genderOptions } = useTournamentCategories();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [near, setNear] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [result, setResult] = useState({ items: [], total: 0, queryKey: null });

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(search && { search }),
      ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
      ...(near && { latitude: near.latitude, longitude: near.longitude, radiusKm: near.radiusKm }),
    }),
    [page, search, filters, near],
  );
  const queryKey = JSON.stringify(params);
  const isLoading = result.queryKey !== queryKey;

  useEffect(() => {
    const controller = new AbortController();
    listTournaments(JSON.parse(queryKey), { signal: controller.signal }).then((res) => {
      if (!res.cancelled)
        setResult({ items: res.ok ? res.data : [], total: res.meta?.total ?? 0, queryKey });
    });
    return () => controller.abort();
  }, [queryKey]);

  const updateFilter = (name, value) => {
    setFilters((previous) => ({ ...previous, [name]: value }));
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const toggleNearMe = async () => {
    if (near) {
      setNear(null);
      return;
    }
    setIsLocating(true);
    try {
      const { coords } = await getCurrentPosition();
      setNear({
        latitude: coords.latitude,
        longitude: coords.longitude,
        radiusKm: DEFAULT_NEAR_ME_RADIUS_KM,
      });
      setPage(1);
    } catch {
      toast.error("Couldn't get your location. Allow location access and try again.");
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-3xl text-fg sm:text-4xl">Tournaments</h1>
        <p className="mt-1 text-fg-muted">Find football tournaments by name, place or near you.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchInput
            placeholder="Search by tournament, venue, area or city"
            onSearch={handleSearch}
            className="flex-1"
          />
          <Button
            variant={near ? "primary" : "outline"}
            onClick={toggleNearMe}
            loading={isLocating}
            startIcon={near ? <LocateOff className="size-4" /> : <LocateFixed className="size-4" />}
          >
            {near ? "Near me: on" : "Near me"}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <Select
            name="status"
            placeholder="Any status"
            clearable
            options={PUBLIC_STATUS_OPTIONS}
            value={filters.status}
            onChange={updateFilter}
          />
          <Select
            name="gameFormatId"
            placeholder="Any format"
            clearable
            options={gameFormatOptions}
            value={filters.gameFormatId}
            onChange={updateFilter}
          />
          <Select
            name="ageGroupId"
            placeholder="Any age group"
            clearable
            options={ageGroupOptions}
            value={filters.ageGroupId}
            onChange={updateFilter}
          />
          <Select
            name="genderCategoryId"
            placeholder="Any category"
            clearable
            options={genderOptions}
            value={filters.genderCategoryId}
            onChange={updateFilter}
          />
          {near && (
            <Select
              name="radiusKm"
              options={NEAR_ME_RADIUS_OPTIONS}
              value={near.radiusKm}
              onChange={(_, radiusKm) => {
                setNear((previous) => ({ ...previous, radiusKm }));
                setPage(1);
              }}
            />
          )}
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      )}
      {!isLoading && result.items.length === 0 && (
        <EmptyState
          icon={Trophy}
          title="No tournaments found"
          description={
            near
              ? "Try a bigger distance or clear some filters."
              : "Try another search or clear some filters."
          }
        />
      )}
      {!isLoading && result.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={result.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default TournamentsPage;
