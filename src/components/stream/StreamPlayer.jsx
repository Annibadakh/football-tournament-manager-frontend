import { ExternalLink, PlayCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import {
  STREAM_STATUS,
  STREAM_STATUS_BADGE,
  STREAM_STATUS_LABEL,
} from "@/constants/stream.constants";
import { formatKickoff } from "@/utils/match";

const WatchOnYouTube = ({ stream, className = "" }) => (
  <a
    href={stream.watchUrl}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline ${className}`}
  >
    Watch on YouTube <ExternalLink className="size-3.5" aria-hidden="true" />
  </a>
);

/**
 * Embedded YouTube player (privacy-enhanced domain). When the channel blocks embedding,
 * a thumbnail with a "Watch on YouTube" button is shown instead. A direct link is always
 * available under the player in case YouTube refuses playback for another reason.
 */
const StreamPlayer = ({ stream, showMeta = true }) => {
  const canEmbed = stream.isEmbeddable !== false;
  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-ink-900">
        {canEmbed ? (
          <iframe
            src={`${stream.embedUrl}?rel=0&modestbranding=1`}
            title={stream.title}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <a
            href={stream.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute inset-0 flex items-center justify-center"
          >
            <img
              src={stream.thumbnailUrl}
              alt=""
              className="absolute inset-0 size-full object-cover opacity-70"
            />
            <span className="relative inline-flex items-center gap-2 rounded-full bg-live px-4 py-2 font-semibold text-white shadow-lg group-hover:scale-105">
              <PlayCircle className="size-5" aria-hidden="true" /> Watch on YouTube
            </span>
          </a>
        )}
      </div>
      {showMeta && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Badge size="sm" variant={STREAM_STATUS_BADGE[stream.status]}>
              {STREAM_STATUS_LABEL[stream.status]}
            </Badge>
            <span className="truncate font-semibold text-fg">{stream.title}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-fg-muted">
            {stream.status === STREAM_STATUS.SCHEDULED && stream.scheduledAt && (
              <span>{formatKickoff(stream.scheduledAt)} IST</span>
            )}
            {canEmbed && <WatchOnYouTube stream={stream} className="text-xs" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamPlayer;
