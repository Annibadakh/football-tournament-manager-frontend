import { useEffect, useState } from "react";
import { BadgeCheck, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import SearchInput from "@/components/ui/SearchInput";
import Spinner from "@/components/ui/Spinner";
import { searchPlayers } from "@/services/team.service";
import { cn } from "@/utils/cn";

const MIN_QUERY = 2;
const RESULT_LIMIT = 8;

const PlayerSummary = ({ player }) => (
  <div className="flex min-w-0 items-center gap-3">
    <Avatar src={player.photoUrl} name={player.fullName} size="sm" />
    <div className="min-w-0">
      <p className="flex items-center gap-1 truncate text-sm font-semibold text-fg">
        {player.fullName}
        <BadgeCheck
          className="size-4 shrink-0 text-brand-600 dark:text-brand-400"
          aria-label="Verified"
        />
      </p>
      <p className="truncate text-xs text-fg-muted">
        {[player.positions.map((position) => position.shortName).join(", "), player.city?.name]
          .filter(Boolean)
          .join(" · ") || "No positions yet"}
      </p>
    </div>
  </div>
);

// Search verified players by name; value is the chosen player card (with positions)
const PlayerPicker = ({ value, onChange, error }) => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState({ items: [], forQuery: "" });
  const isSearching = query.length >= MIN_QUERY && result.forQuery !== query;

  useEffect(() => {
    if (query.length < MIN_QUERY) return undefined;
    const controller = new AbortController();
    searchPlayers({ search: query, pageSize: RESULT_LIMIT }, { signal: controller.signal }).then(
      (res) => {
        if (!res.cancelled) setResult({ items: res.ok ? res.data : [], forQuery: query });
      },
    );
    return () => controller.abort();
  }, [query]);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-600 bg-brand-50 px-3 py-2 dark:bg-brand-950">
        <PlayerSummary player={value} />
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Choose another player"
          className="rounded p-1 text-fg-muted hover:text-fg"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <SearchInput
        placeholder="Search verified players by name"
        onSearch={setQuery}
        delay={300}
        className={cn(error && "border-danger")}
      />
      {error && <p className="px-1 text-xs text-danger">{error}</p>}
      {isSearching && (
        <p className="flex items-center gap-2 px-1 text-sm text-fg-muted">
          <Spinner size="sm" /> Searching...
        </p>
      )}
      {!isSearching && query.length >= MIN_QUERY && (
        <ul className="max-h-64 overflow-y-auto rounded-lg border border-line" aria-label="Players">
          {result.items.length === 0 && (
            <li className="px-3 py-2 text-sm text-fg-muted">
              No verified players found. Add them as a guest instead.
            </li>
          )}
          {result.items.map((player) => (
            <li key={player.id}>
              <button
                type="button"
                onClick={() => onChange(player)}
                className="w-full px-3 py-2 text-left hover:bg-surface-muted"
              >
                <PlayerSummary player={player} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayerPicker;
