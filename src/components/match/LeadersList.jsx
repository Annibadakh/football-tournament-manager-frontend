const LeaderColumn = ({ title, unit, entries }) => (
  <div>
    <h3 className="mb-2 font-semibold text-fg">{title}</h3>
    {entries.length === 0 ? (
      <p className="text-sm text-fg-muted">None yet.</p>
    ) : (
      <ol className="flex flex-col divide-y divide-line">
        {entries.map((entry, index) => (
          <li key={entry.player.id} className="flex items-center gap-3 py-2 text-sm">
            <span className="w-5 font-semibold text-fg-muted">{index + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-fg">{entry.player.fullName}</span>
              <span className="block truncate text-xs text-fg-muted">{entry.team.name}</span>
            </span>
            <span className="font-brand text-lg font-bold tabular-nums">{entry.count}</span>
            <span className="sr-only">{unit}</span>
          </li>
        ))}
      </ol>
    )}
  </div>
);

// Top scorers and assists (own goals and walkover goals don't count)
const LeadersList = ({ leaders }) => (
  <div className="grid gap-6 sm:grid-cols-2">
    <LeaderColumn title="Top scorers" unit="goals" entries={leaders.scorers} />
    <LeaderColumn title="Top assists" unit="assists" entries={leaders.assists} />
  </div>
);

export default LeadersList;
