import { useState } from "react";
import { Shuffle } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormInput from "@/components/ui/FormInput";
import Select from "@/components/ui/Select";
import { TOURNAMENT_FORMAT } from "@/constants/tournament.constants";
import { drawGroups, saveGroups } from "@/services/match.service";

const UNASSIGNED = "__none__";

// Organizer draws teams into groups, then moves teams between groups before generating fixtures
const GroupsEditor = ({ tournament, groupsData, hasFixtures, onChanged }) => {
  const needsQualifiers = tournament.tournamentFormat === TOURNAMENT_FORMAT.GROUP_KNOCKOUT;
  const [groupsCount, setGroupsCount] = useState(String(groupsData.groupsCount ?? 2));
  const [qualifiers, setQualifiers] = useState(String(groupsData.qualifiersPerGroup ?? 2));
  // Remounted (key) by the parent whenever groups reload, so the draft starts from saved data
  const [draft, setDraft] = useState(() =>
    groupsData.groups.map((group) => ({ name: group.name, teams: group.teams })),
  );
  const [isDirty, setIsDirty] = useState(false);
  const [busy, setBusy] = useState(null);

  const unassigned = groupsData.eligibleTeams.filter(
    (team) => !draft.some((group) => group.teams.some((member) => member.id === team.id)),
  );
  const moveOptions = [
    ...draft.map((group) => ({ label: `Group ${group.name}`, value: group.name })),
    { label: "Not in a group", value: UNASSIGNED },
  ];

  const moveTeam = (team, target) => {
    setDraft((groups) =>
      groups.map((group) => {
        const without = group.teams.filter((member) => member.id !== team.id);
        return { ...group, teams: group.name === target ? [...without, team] : without };
      }),
    );
    setIsDirty(true);
  };

  const qualifierPayload = needsQualifiers ? { qualifiersPerGroup: Number(qualifiers) } : {};

  const draw = async () => {
    setBusy("draw");
    const res = await drawGroups(tournament.slug, {
      groupsCount: Number(groupsCount),
      ...qualifierPayload,
    });
    setBusy(null);
    if (res.ok) onChanged();
  };

  const save = async () => {
    setBusy("save");
    const res = await saveGroups(tournament.slug, {
      ...qualifierPayload,
      groups: draft.map((group) => ({
        name: group.name,
        teamIds: group.teams.map((team) => team.id),
      })),
    });
    setBusy(null);
    if (res.ok) onChanged();
  };

  return (
    <Card
      title="Groups"
      subtitle={
        hasFixtures
          ? "Delete the fixtures to change groups"
          : "Draw teams into groups, then move teams if needed"
      }
      actions={
        isDirty && (
          <Button size="sm" loading={busy === "save"} onClick={save}>
            Save groups
          </Button>
        )
      }
    >
      {!hasFixtures && (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <FormInput
            name="groupsCount"
            label="Number of groups"
            type="number"
            min={1}
            max={16}
            value={groupsCount}
            onChange={(_, value) => setGroupsCount(value)}
            className="w-40"
          />
          {needsQualifiers && (
            <FormInput
              name="qualifiersPerGroup"
              label="Qualify per group"
              type="number"
              min={1}
              max={8}
              value={qualifiers}
              onChange={(_, value) => setQualifiers(value)}
              className="w-40"
            />
          )}
          <Button
            variant="outline"
            loading={busy === "draw"}
            onClick={draw}
            startIcon={<Shuffle className="size-4" />}
          >
            {draft.length ? "Redraw" : "Draw groups"}
          </Button>
        </div>
      )}

      {draft.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {draft.map((group) => (
            <div key={group.name} className="rounded-xl border border-line p-3">
              <h4 className="mb-2 font-semibold text-fg">
                Group {group.name}{" "}
                <span className="text-xs font-normal text-fg-muted">
                  {group.teams.length} teams
                </span>
              </h4>
              <ul className="flex flex-col gap-1.5">
                {group.teams.map((team) => (
                  <li key={team.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-fg">{team.name}</span>
                    {!hasFixtures && (
                      <Select
                        name={`move-${team.id}`}
                        ariaLabel={`Move ${team.name}`}
                        options={moveOptions}
                        value={group.name}
                        onChange={(_, target) => moveTeam(team, target)}
                        className="w-36 shrink-0"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {unassigned.length > 0 && draft.length > 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-line p-3">
          <h4 className="mb-2 text-sm font-semibold text-fg">Not in a group</h4>
          <ul className="flex flex-col gap-1.5">
            {unassigned.map((team) => (
              <li key={team.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-fg">{team.name}</span>
                <Select
                  name={`add-${team.id}`}
                  ariaLabel={`Add ${team.name} to a group`}
                  options={moveOptions.filter((option) => option.value !== UNASSIGNED)}
                  value={null}
                  placeholder="Add to…"
                  onChange={(_, target) => moveTeam(team, target)}
                  className="w-36 shrink-0"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default GroupsEditor;
