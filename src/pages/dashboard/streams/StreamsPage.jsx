import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import PageLoader from "@/components/ui/PageLoader";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { getTournament } from "@/services/tournament.service";
import StreamsManager from "@/pages/dashboard/streams/StreamsManager";

// Media operators manage a tournament's streams here (they can't open the tournament editor)
const StreamsPage = () => {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(undefined);

  useEffect(() => {
    getTournament(tournamentId, { errorToast: false }).then((res) =>
      setTournament(res.ok ? res.data : null),
    );
  }, [tournamentId]);

  if (tournament === undefined) return <PageLoader label="Loading tournament..." />;
  if (!tournament) return <EmptyState title="Tournament not found" className="min-h-[50vh]" />;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={tournament.name}
        subtitle={
          <Link
            to={buildPath(ROUTES.TOURNAMENT, { tournamentId: tournament.slug })}
            className="font-semibold text-link hover:underline"
          >
            View public page
          </Link>
        }
      />
      <StreamsManager tournament={tournament} />
    </div>
  );
};

export default StreamsPage;
