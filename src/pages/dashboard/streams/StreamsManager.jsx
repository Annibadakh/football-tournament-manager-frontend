import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Radio, Square, Trash2, Undo2 } from "lucide-react";
import StreamPlayer from "@/components/stream/StreamPlayer";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import {
  STREAM_STATUS,
  STREAM_STATUS_BADGE,
  STREAM_STATUS_LABEL,
} from "@/constants/stream.constants";
import { listMatches } from "@/services/match.service";
import { deleteStream, listStreams, updateStream } from "@/services/stream.service";
import { formatKickoff } from "@/utils/match";
import StreamFormModal from "@/pages/dashboard/streams/StreamFormModal";

// Status buttons: Scheduled → Go live → End (and back if pressed by mistake)
const STATUS_ACTIONS = {
  [STREAM_STATUS.SCHEDULED]: [
    { status: STREAM_STATUS.LIVE, label: "Go live", icon: Radio, variant: "primary" },
  ],
  [STREAM_STATUS.LIVE]: [
    { status: STREAM_STATUS.ENDED, label: "End stream", icon: Square, variant: "outline" },
  ],
  [STREAM_STATUS.ENDED]: [
    { status: STREAM_STATUS.LIVE, label: "Live again", icon: Undo2, variant: "ghost" },
  ],
};

// Organizer / media operator: add YouTube streams, switch them live, end, edit, remove
const StreamsManager = ({ tournament }) => {
  const [data, setData] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([listStreams(tournament.slug), listMatches(tournament.slug)]).then(
      ([streamsRes, matchesRes]) => {
        if (!isCurrent) return;
        setData({
          streams: streamsRes.ok ? streamsRes.data.streams : [],
          isEnabled: streamsRes.ok && streamsRes.data.isEnabled,
          matches: matchesRes.ok ? matchesRes.data : [],
        });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [tournament.slug, reloadCount]);

  if (!data) return <Skeleton className="h-48 w-full rounded-2xl" />;
  if (!data.isEnabled)
    return (
      <EmptyState
        title="Streaming is off for this tournament"
        description="An admin can turn on live streaming for this tournament."
      />
    );

  const takenMatchIds = new Set(
    data.streams.filter((stream) => stream.match).map((stream) => stream.match.id),
  );

  const setStatus = async (stream, status) => {
    setBusyId(stream.id);
    const res = await updateStream(stream.id, { status });
    setBusyId(null);
    if (res.ok) reload();
  };

  const remove = async () => {
    setBusyId(confirmDelete.id);
    const res = await deleteStream(confirmDelete.id);
    setBusyId(null);
    setConfirmDelete(null);
    if (res.ok) reload();
  };

  return (
    <Card
      title="Live streams"
      subtitle="YouTube links for the tournament (ceremonies, events) and one per match"
      actions={
        <Button size="sm" onClick={() => setModal({})} startIcon={<Plus className="size-4" />}>
          Add stream
        </Button>
      }
    >
      {data.streams.length === 0 ? (
        <EmptyState
          title="No streams yet"
          description="Start a live stream on YouTube, then add its link here. Viewers watch it on Maidaan."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {data.streams.map((stream) => (
            <li key={stream.id} className="flex flex-col gap-3 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setPreviewId(previewId === stream.id ? null : stream.id)}
                  className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-ink-900 sm:w-36"
                  aria-label={`Preview ${stream.title}`}
                >
                  <img src={stream.thumbnailUrl} alt="" className="size-full object-cover" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge size="sm" variant={STREAM_STATUS_BADGE[stream.status]}>
                      {STREAM_STATUS_LABEL[stream.status]}
                    </Badge>
                    {stream.isEmbeddable === false && (
                      <Badge size="sm" variant="warning">
                        Embedding off
                      </Badge>
                    )}
                    {stream.isEmbeddable === null && (
                      <Badge size="sm" variant="neutral">
                        Not checked
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate font-semibold text-fg">{stream.title}</p>
                  <p className="text-xs text-fg-muted">
                    {stream.match
                      ? `Match M${stream.match.matchNumber} · `
                      : "Tournament stream · "}
                    {stream.scheduledAt
                      ? `${formatKickoff(stream.scheduledAt)} IST`
                      : "Time not set"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {STATUS_ACTIONS[stream.status].map((action) => (
                    <Button
                      key={action.status}
                      size="sm"
                      variant={action.variant}
                      loading={busyId === stream.id}
                      onClick={() => setStatus(stream, action.status)}
                      startIcon={<action.icon className="size-4" />}
                    >
                      {action.label}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-2"
                    aria-label={`Edit ${stream.title}`}
                    onClick={() => setModal({ stream })}
                    startIcon={<Pencil className="size-4" />}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-2 text-danger"
                    aria-label={`Remove ${stream.title}`}
                    onClick={() => setConfirmDelete(stream)}
                    startIcon={<Trash2 className="size-4" />}
                  />
                </div>
              </div>
              {previewId === stream.id && <StreamPlayer stream={stream} showMeta={false} />}
            </li>
          ))}
        </ul>
      )}
      {modal && (
        <StreamFormModal
          tournamentId={tournament.slug}
          stream={modal.stream}
          matches={data.matches}
          takenMatchIds={takenMatchIds}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            reload();
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={remove}
        loading={Boolean(busyId)}
        title={`Remove "${confirmDelete?.title}"?`}
        message="The stream disappears from Maidaan. The video stays on YouTube."
        confirmText="Remove stream"
      />
    </Card>
  );
};

export default StreamsManager;
