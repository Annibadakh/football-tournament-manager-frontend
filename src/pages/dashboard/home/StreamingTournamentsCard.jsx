import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Video } from "lucide-react";
import Card from "@/components/ui/Card";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { listMyStreamingTournaments } from "@/services/stream.service";

// Media operators: tournaments whose streams they manage
const StreamingTournamentsCard = () => {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    let isCurrent = true;
    listMyStreamingTournaments({ errorToast: false }).then((res) => {
      if (isCurrent && res.ok) setTournaments(res.data);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  if (!tournaments.length) return null;
  return (
    <Card title="Tournaments you stream" subtitle="Add YouTube links and switch streams live">
      <ul className="flex flex-col divide-y divide-line">
        {tournaments.map((tournament) => (
          <li key={tournament.id}>
            <Link
              to={buildPath(ROUTES.STREAMS, { tournamentId: tournament.slug })}
              className="flex items-center gap-3 py-2.5 text-sm font-semibold text-fg hover:text-link"
            >
              <Video className="size-5 shrink-0 text-live" aria-hidden="true" />
              {tournament.name}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default StreamingTournamentsCard;
