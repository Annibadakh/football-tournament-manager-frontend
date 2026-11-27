import { useEffect, useState } from "react";
import BracketView from "@/components/match/BracketView";
import MatchList from "@/components/match/MatchList";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import { getBracket, getGroups, listMatches } from "@/services/match.service";

const VIEW_OPTIONS = [
  { value: "round", label: "By round" },
  { value: "date", label: "By date" },
];

// Public fixtures, groups and bracket; hidden until fixtures exist
const FixturesSection = ({ tournamentId }) => {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("fixtures");
  const [groupBy, setGroupBy] = useState("round");

  useEffect(() => {
    let isCurrent = true;
    const quiet = { errorToast: false };
    Promise.all([
      listMatches(tournamentId, {}, quiet),
      getGroups(tournamentId, quiet),
      getBracket(tournamentId, quiet),
    ]).then(([matchesRes, groupsRes, bracketRes]) => {
      if (!isCurrent) return;
      setData({
        matches: matchesRes.ok ? matchesRes.data : [],
        groups: groupsRes.ok ? groupsRes.data.groups : [],
        bracket: bracketRes.ok ? bracketRes.data : { rounds: [] },
      });
    });
    return () => {
      isCurrent = false;
    };
  }, [tournamentId]);

  if (!data || data.matches.length === 0) return null;

  const tabs = [
    { value: "fixtures", label: "Fixtures & results" },
    ...(data.groups.length ? [{ value: "groups", label: "Groups" }] : []),
    ...(data.bracket.rounds.length ? [{ value: "bracket", label: "Bracket" }] : []),
  ];

  return (
    <Card title="Matches" subtitle={`${data.matches.length} matches · times in IST`}>
      {tabs.length > 1 && <Tabs items={tabs} value={tab} onChange={setTab} className="mb-4" />}
      {tab === "fixtures" && (
        <>
          <Tabs items={VIEW_OPTIONS} value={groupBy} onChange={setGroupBy} className="mb-3" />
          <MatchList matches={data.matches} groupBy={groupBy} />
        </>
      )}
      {tab === "groups" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.groups.map((group) => (
            <div key={group.id} className="rounded-xl border border-line p-3">
              <h3 className="mb-2 font-semibold text-fg">Group {group.name}</h3>
              <ul className="flex flex-col gap-1 text-sm text-fg">
                {group.teams.map((team) => (
                  <li key={team.id} className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-md bg-brand-700 text-[10px] font-bold text-white">
                      {team.shortName}
                    </span>
                    {team.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {tab === "bracket" && <BracketView bracket={data.bracket} />}
    </Card>
  );
};

export default FixturesSection;
