import Badge from "@/components/ui/Badge";
import {
  STREAM_STATUS,
  STREAM_STATUS_BADGE,
  STREAM_STATUS_LABEL,
} from "@/constants/stream.constants";
import { cn } from "@/utils/cn";
import { formatKickoff } from "@/utils/match";

// Clickable stream tile: thumbnail, status, title, time or match
const StreamThumb = ({ stream, isSelected = false, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(stream)}
    aria-pressed={isSelected}
    className={cn(
      "flex w-full gap-3 rounded-xl border p-2 text-left transition-colors",
      isSelected
        ? "border-brand-500 bg-brand-50/60 dark:bg-brand-900/30"
        : "border-line hover:bg-surface-muted",
    )}
  >
    <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-ink-900">
      <img src={stream.thumbnailUrl} alt="" className="size-full object-cover" loading="lazy" />
    </span>
    <span className="flex min-w-0 flex-col gap-1">
      <Badge size="sm" variant={STREAM_STATUS_BADGE[stream.status]} className="self-start">
        {STREAM_STATUS_LABEL[stream.status]}
      </Badge>
      <span className="line-clamp-2 text-sm font-semibold text-fg">{stream.title}</span>
      <span className="text-xs text-fg-muted">
        {stream.status === STREAM_STATUS.SCHEDULED && stream.scheduledAt
          ? `${formatKickoff(stream.scheduledAt)} IST`
          : stream.match
            ? `Match M${stream.match.matchNumber}`
            : (stream.channelName ?? "")}
      </span>
    </span>
  </button>
);

export default StreamThumb;
