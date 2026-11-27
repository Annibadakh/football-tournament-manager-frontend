import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import StreamPlayer from "@/components/stream/StreamPlayer";
import StreamThumb from "@/components/stream/StreamThumb";
import Card from "@/components/ui/Card";
import { STREAM_STATUS } from "@/constants/stream.constants";
import { listStreams } from "@/services/stream.service";

// Live now player + upcoming streams and replays; hidden when streaming is off or empty
const StreamsSection = ({ tournamentId }) => {
  const [streams, setStreams] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    listStreams(tournamentId, { errorToast: false }).then((res) => {
      if (isCurrent) setStreams(res.ok && res.data.isEnabled ? res.data.streams : []);
    });
    return () => {
      isCurrent = false;
    };
  }, [tournamentId]);

  if (!streams?.length) return null;
  // Streams arrive live first, then upcoming, then replays
  const selected = streams.find((stream) => stream.id === selectedId) ?? streams[0];
  const liveCount = streams.filter((stream) => stream.status === STREAM_STATUS.LIVE).length;

  return (
    <Card
      title={
        liveCount ? (
          <span className="inline-flex items-center gap-2">
            <Radio className="size-5 text-live" aria-hidden="true" /> Live now
          </span>
        ) : (
          "Streams"
        )
      }
      subtitle={`${streams.length} ${streams.length === 1 ? "stream" : "streams"} on YouTube`}
    >
      <div className="flex flex-col gap-4">
        <StreamPlayer key={selected.id} stream={selected} />
        {streams.length > 1 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {streams.map((stream) => (
              <StreamThumb
                key={stream.id}
                stream={stream}
                isSelected={stream.id === selected.id}
                onSelect={(item) => setSelectedId(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StreamsSection;
