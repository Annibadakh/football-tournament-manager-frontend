import { useEffect, useId, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import FieldWrapper from "@/components/ui/FieldWrapper";
import Spinner from "@/components/ui/Spinner";
import useDebounce from "@/hooks/useDebounce";
import { PLACE_QUERY_MIN, PLACE_SEARCH_TYPE } from "@/constants/place.constants";
import { resolvePlace, searchPlaces } from "@/services/place.service";
import { cn } from "@/utils/cn";

const newSessionToken = () => crypto.randomUUID();

/**
 * Google Places search through our API. value is a saved place ({ id, name, formattedAddress })
 * and onChange(name, place | null) receives the saved place after the user picks a suggestion.
 */
const PlaceSearch = ({
  name,
  label,
  value,
  onChange,
  type = PLACE_SEARCH_TYPE.ANY,
  placeholder = "Search a place",
  error,
  helperText,
  required = false,
  disabled = false,
  className = "",
}) => {
  const id = `${useId()}-${name}`;
  const containerRef = useRef(null);
  // One token per search session: Google bills autocomplete + details together
  const sessionTokenRef = useRef(newSessionToken());
  const [query, setQuery] = useState("");
  const [isEditing, setIsEditing] = useState(!value);
  const [suggestions, setSuggestions] = useState({ items: [], forQuery: "" });
  const [isResolving, setIsResolving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebounce(query.trim(), 300);
  const shouldSearch = isEditing && debouncedQuery.length >= PLACE_QUERY_MIN;
  const isSearching = shouldSearch && suggestions.forQuery !== debouncedQuery;
  const isOpen = isEditing && query.trim().length >= PLACE_QUERY_MIN;

  useEffect(() => {
    if (!shouldSearch) return undefined;
    const controller = new AbortController();
    searchPlaces(
      { query: debouncedQuery, type, sessionToken: sessionTokenRef.current },
      { signal: controller.signal },
    ).then((res) => {
      if (!res.cancelled)
        setSuggestions({ items: res.ok ? res.data : [], forQuery: debouncedQuery });
    });
    return () => controller.abort();
  }, [debouncedQuery, shouldSearch, type]);

  useEffect(() => {
    if (!isEditing || !value) return undefined;
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsEditing(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isEditing, value]);

  const selectSuggestion = async (suggestion) => {
    setIsResolving(true);
    const res = await resolvePlace({
      googlePlaceId: suggestion.googlePlaceId,
      sessionToken: sessionTokenRef.current,
    });
    setIsResolving(false);
    if (!res.ok) return;
    sessionTokenRef.current = newSessionToken();
    setQuery("");
    setIsEditing(false);
    onChange?.(name, res.data);
  };

  const handleKeyDown = (event) => {
    if (!isOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && suggestions.items[activeIndex]) {
      event.preventDefault();
      selectSuggestion(suggestions.items[activeIndex]);
    } else if (event.key === "Escape" && value) {
      setIsEditing(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <FieldWrapper
        id={id}
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        disabled={disabled}
      >
        {!isEditing && value ? (
          <div className="flex h-8 items-center gap-2">
            <MapPin
              className="size-4 shrink-0 text-brand-600 dark:text-brand-400"
              aria-hidden="true"
            />
            <button
              id={id}
              type="button"
              disabled={disabled}
              onClick={() => setIsEditing(true)}
              className="min-w-0 flex-1 truncate text-left text-sm text-fg"
              title="Change place"
            >
              {value.name}
              {value.formattedAddress && value.formattedAddress !== value.name && (
                <span className="text-fg-muted"> · {value.formattedAddress}</span>
              )}
            </button>
            {!required && !disabled && (
              <button
                type="button"
                onClick={() => onChange?.(name, null)}
                aria-label={`Clear ${label ?? "place"}`}
                className="rounded p-1 text-fg-muted hover:text-fg"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-fg-muted" aria-hidden="true" />
            <input
              id={id}
              role="combobox"
              aria-expanded={isOpen}
              aria-autocomplete="list"
              aria-invalid={Boolean(error)}
              autoComplete="off"
              autoFocus={Boolean(value)}
              disabled={disabled}
              value={query}
              placeholder={placeholder}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="h-8 w-full min-w-0 bg-transparent text-sm text-fg outline-none placeholder:text-fg-muted/70"
            />
            {(isSearching || isResolving) && <Spinner size="sm" className="text-fg-muted" />}
          </div>
        )}
      </FieldWrapper>

      {isOpen && !isSearching && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-line bg-surface py-1 shadow-lg"
        >
          {suggestions.items.length === 0 && (
            <li className="px-3 py-2 text-sm text-fg-muted">No places found</li>
          )}
          {suggestions.items.map((suggestion, index) => (
            <li
              key={suggestion.googlePlaceId}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(suggestion)}
              className={cn(
                "cursor-pointer px-3 py-2",
                index === activeIndex && "bg-surface-muted",
              )}
            >
              <p className="text-sm font-semibold text-fg">{suggestion.primaryText}</p>
              {suggestion.secondaryText && (
                <p className="text-xs text-fg-muted">{suggestion.secondaryText}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaceSearch;
