import { useEffect, useState } from "react";
import BracketView from "@/components/match/BracketView";
import LeadersList from "@/components/match/LeadersList";
import MatchList from "@/components/match/MatchList";
import StandingsTable from "@/components/match/StandingsTable";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import { MATCH_STATUS } from "@/constants/match.constants";
import { getBracket, getLeaders, getStandings, listMatches } from "@/services/match.service";

const VIEW_OPTIONS = [
  { value: "round", label: "By round" },
  { value: "date", label: "By date" },
];

// Public fixtures, tables, bracket and leaders; hidden until fixtures exist
const FixturesSection = ({ tournamentId }) => {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("fixtures");
  const [groupBy, setGroupBy] = useState("round");

  useEffect(() => {
    let isCurrent = true;
    const quiet = { errorToast: false };
    Promise.all([
      listMatches(tournamentId, {}, quiet),
      getStandings(tournamentId, quiet),
      getBracket(tournamentId, quiet),
      getLeaders(tournamentId, quiet),
    ]).then(([matchesRes, standingsRes, bracketRes, leadersRes]) => {
      if (!isCurrent) return;
      setData({
        matches: matchesRes.ok ? matchesRes.data : [],
        tables: standingsRes.ok ? standingsRes.data.tables : [],
        bracket: bracketRes.ok ? bracketRes.data : { rounds: [] },
        leaders: leadersRes.ok ? leadersRes.data : { scorers: [], assists: [] },
      });
    });
    return () => {
      isCurrent = false;
    };
  }, [tournamentId]);

  if (!data || data.matches.length === 0) return null;

  const liveCount = data.matches.filter((match) => match.status === MATCH_STATUS.LIVE).length;
  const hasGroups = data.tables.some((table) => table.group);
  const tabs = [
    { value: "fixtures", label: "Fixtures & results" },
    ...(data.tables.length ? [{ value: "table", label: hasGroups ? "Groups" : "Table" }] : []),
    ...(data.bracket.rounds.length ? [{ value: "bracket", label: "Bracket" }] : []),
    { value: "leaders", label: "Top scorers" },
  ];

  return (
    <Card
      title="Matches"
      subtitle={`${data.matches.length} matches · times in IST${liveCount ? ` · ${liveCount} live now` : ""}`}
    >
      <Tabs items={tabs} value={tab} onChange={setTab} className="mb-4" />
      {tab === "fixtures" && (
        <>
          <Tabs items={VIEW_OPTIONS} value={groupBy} onChange={setGroupBy} className="mb-3" />
          <MatchList matches={data.matches} groupBy={groupBy} />
        </>
      )}
      {tab === "table" && (
        <div className="flex flex-col gap-5">
          {data.tables.map((table) => (
            <StandingsTable
              key={table.group?.id ?? "league"}
              title={table.group ? `Group ${table.group.name}` : null}
              rows={table.rows}
              qualifiers={table.qualifiers}
            />
          ))}
        </div>
      )}
      {tab === "bracket" && <BracketView bracket={data.bracket} />}
      {tab === "leaders" && <LeadersList leaders={data.leaders} />}
    </Card>
  );
};

export default FixturesSection;
