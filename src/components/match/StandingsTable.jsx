import { Link } from "react-router-dom";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { cn } from "@/utils/cn";

const FORM_STYLE = {
  W: "bg-brand-600 text-white",
  D: "bg-ink-300 text-ink-900 dark:bg-ink-600 dark:text-white",
  L: "bg-red-600 text-white",
};

const COLUMNS = [
  ["played", "P", "Played"],
  ["won", "W", "Won"],
  ["drawn", "D", "Drawn"],
  ["lost", "L", "Lost"],
  ["goalsFor", "GF", "Goals for"],
  ["goalsAgainst", "GA", "Goals against"],
  ["goalDifference", "GD", "Goal difference"],
];

// League / group table; the top `qualifiers` rows are highlighted
const StandingsTable = ({ title, rows, qualifiers = null }) => (
  <div>
    {title && <h3 className="mb-2 font-semibold text-fg">{title}</h3>}
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[34rem] text-sm">
        <thead className="bg-surface-muted text-xs text-fg-muted">
          <tr>
            <th className="w-8 px-2 py-2 text-left">#</th>
            <th className="px-2 py-2 text-left">Team</th>
            {COLUMNS.map(([key, short, full]) => (
              <th key={key} className="px-1.5 py-2 text-center" title={full}>
                <abbr title={full} className="no-underline">
                  {short}
                </abbr>
              </th>
            ))}
            <th className="px-2 py-2 text-center">Pts</th>
            <th className="px-2 py-2 text-left">Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.team.id}
              className={cn(
                "border-t border-line",
                qualifiers && row.position <= qualifiers && "bg-brand-50/60 dark:bg-brand-900/30",
              )}
            >
              <td className="px-2 py-2 font-semibold text-fg-muted">{row.position}</td>
              <td className="px-2 py-2">
                <Link
                  to={buildPath(ROUTES.TEAM, { teamId: row.team.id })}
                  className="font-semibold text-fg hover:underline"
                >
                  {row.team.name}
                </Link>
              </td>
              {COLUMNS.map(([key]) => (
                <td key={key} className="px-1.5 py-2 text-center tabular-nums">
                  {key === "goalDifference" && row[key] > 0 ? `+${row[key]}` : row[key]}
                </td>
              ))}
              <td className="px-2 py-2 text-center font-bold tabular-nums">{row.points}</td>
              <td className="px-2 py-2">
                <span className="flex gap-0.5">
                  {row.form.map((result, index) => (
                    <span
                      key={index}
                      className={cn(
                        "flex size-5 items-center justify-center rounded text-[10px] font-bold",
                        FORM_STYLE[result],
                      )}
                    >
                      {result}
                    </span>
                  ))}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {qualifiers && (
      <p className="mt-1 text-xs text-fg-muted">
        Highlighted: top {qualifiers} go to the knockouts
      </p>
    )}
  </div>
);

export default StandingsTable;
