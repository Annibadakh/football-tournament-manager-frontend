import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { CARD_NOTICE_REASON } from "@/constants/match.constants";
import { handleCardNotice, listCardNotices } from "@/services/match.service";

// Open card notices (no automatic suspension: the organizer decides and marks them handled)
const CardNoticesCard = ({ tournamentId, reloadKey }) => {
  const [notices, setNotices] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    listCardNotices(tournamentId, { errorToast: false }).then((res) => {
      if (isCurrent && res.ok) setNotices(res.data);
    });
    return () => {
      isCurrent = false;
    };
  }, [tournamentId, reloadKey]);

  if (!notices.length) return null;

  const markHandled = async (notice) => {
    setBusyId(notice.id);
    const res = await handleCardNotice(notice.id);
    setBusyId(null);
    if (res.ok) setNotices((current) => current.filter((item) => item.id !== notice.id));
  };

  return (
    <Card title="Card notices" subtitle="Decide on any suspension before these players' next match">
      <ul className="flex flex-col divide-y divide-line">
        {notices.map((notice) => (
          <li key={notice.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
            <span
              aria-hidden="true"
              className={
                notice.reason === CARD_NOTICE_REASON.RED_CARD
                  ? "h-4 w-3 rounded-sm bg-red-600"
                  : "h-4 w-3 rounded-sm bg-amber-400"
              }
            />
            <span className="min-w-0 flex-1">
              <span className="font-semibold text-fg">{notice.player.fullName}</span>{" "}
              <span className="text-fg-muted">
                ({notice.team.name}) ·{" "}
                {notice.reason === CARD_NOTICE_REASON.RED_CARD
                  ? `red card in M${notice.sourceMatch.matchNumber}`
                  : `${notice.yellowCount} yellow cards (latest in M${notice.sourceMatch.matchNumber})`}
              </span>
            </span>
            <Button
              size="sm"
              variant="outline"
              loading={busyId === notice.id}
              onClick={() => markHandled(notice)}
              startIcon={<Check className="size-4" />}
            >
              Handled
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default CardNoticesCard;
