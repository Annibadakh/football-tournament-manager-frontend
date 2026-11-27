import { useMemo } from "react";
import MatchRow from "@/components/match/MatchRow";
import { formatKickoffDay, groupByDate, groupByRound } from "@/utils/match";

// Fixtures grouped by round (default) or by IST date
const MatchList = ({ matches, groupBy = "round", renderActions, showGroup = true }) => {
  const sections = useMemo(
    () =>
      groupBy === "date"
        ? groupByDate(matches).map((section) => ({
            ...section,
            title:
              section.key === "tba"
                ? "Date to be announced"
                : formatKickoffDay(section.matches[0].scheduledAt),
          }))
        : groupByRound(matches),
    [matches, groupBy],
  );

  return (
    <div className="flex flex-col gap-5">
      {sections.map((section) => (
        <section key={section.key} aria-label={section.title}>
          <h3 className="mb-1 text-xs font-bold tracking-wide text-fg-muted uppercase">
            {section.title}
          </h3>
          <div className="divide-y divide-line">
            {section.matches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                showGroup={showGroup}
                actions={renderActions?.(match)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default MatchList;
