import { useEffect, useState } from "react";
import MatchList from "@/components/match/MatchList";
import Card from "@/components/ui/Card";
import { listMatches } from "@/services/match.service";

// A team's fixtures and results, by date; hidden until it has matches
const TeamMatchesCard = ({ tournamentId, teamId }) => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    let isCurrent = true;
    listMatches(tournamentId, { teamId }, { errorToast: false }).then((res) => {
      if (isCurrent && res.ok) setMatches(res.data);
    });
    return () => {
      isCurrent = false;
    };
  }, [tournamentId, teamId]);

  if (!matches.length) return null;
  return (
    <Card title="Matches" subtitle={`${matches.length} matches · times in IST`}>
      <MatchList matches={matches} groupBy="date" />
    </Card>
  );
};

export default TeamMatchesCard;
