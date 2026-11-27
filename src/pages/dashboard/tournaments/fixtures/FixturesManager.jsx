import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Pencil, Plus, Sparkles, Timer, Trash2 } from "lucide-react";
import MatchList from "@/components/match/MatchList";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import Switch from "@/components/ui/Switch";
import {
  GROUP_FORMATS,
  KNOCKOUT_FORMATS,
  MATCH_STATUS,
  ROUND_ROBIN_FORMATS,
} from "@/constants/match.constants";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import * as matchService from "@/services/match.service";
import { listGrounds } from "@/services/tournament.service";
import AwardsManager from "@/pages/dashboard/tournaments/fixtures/AwardsManager";
import CardNoticesCard from "@/pages/dashboard/tournaments/fixtures/CardNoticesCard";
import GroupsEditor from "@/pages/dashboard/tournaments/fixtures/GroupsEditor";
import MatchFormModal from "@/pages/dashboard/tournaments/fixtures/MatchFormModal";
import MatchSettingsCard from "@/pages/dashboard/tournaments/fixtures/MatchSettingsCard";
import ScheduleModal from "@/pages/dashboard/tournaments/fixtures/ScheduleModal";

const LEG_OPTIONS = [
  { label: "Play each team once", value: 1 },
  { label: "Home and away (twice)", value: 2 },
];

// Organizer: match settings, groups, generate / schedule / edit fixtures
const FixturesManager = ({ tournament, onTournamentSaved }) => {
  const format = tournament.tournamentFormat;
  const usesGroups = GROUP_FORMATS.includes(format);
  const [data, setData] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [options, setOptions] = useState({ legs: 1, thirdPlace: false });
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([
      matchService.listMatches(tournament.slug),
      matchService.getGroups(tournament.slug),
      listGrounds(tournament.slug),
    ]).then(([matchesRes, groupsRes, groundsRes]) => {
      if (!isCurrent) return;
      setData({
        // Remounts the groups editor only once fresh data has arrived
        version: reloadCount,
        matches: matchesRes.ok ? matchesRes.data : [],
        groups: groupsRes.ok ? groupsRes.data : { groups: [], eligibleTeams: [] },
        grounds: groundsRes.ok ? groundsRes.data : [],
      });
    });
    return () => {
      isCurrent = false;
    };
  }, [tournament.slug, reloadCount]);

  if (!format)
    return (
      <EmptyState
        title="Choose the tournament format first"
        description="Set the format (league, knockout or groups) in the Details tab."
      />
    );
  if (!data) return <Skeleton className="h-64 w-full rounded-2xl" />;

  const { matches, groups, grounds } = data;
  const readyTeams = groups.eligibleTeams;
  const hasFixtures = matches.length > 0;
  const hasStarted = matches.some((match) => match.status !== MATCH_STATUS.SCHEDULED);

  const generate = async (replace = false) => {
    setIsBusy(true);
    const res = await matchService.generateFixtures(
      tournament.slug,
      { ...options, replace },
      { errorToast: false },
    );
    setIsBusy(false);
    setConfirm(null);
    if (res.ok) return reload();
    if (res.errors?.some((error) => error.field === "replace")) return setConfirm("replace");
    // Re-run with toasts so the user sees why it failed
    matchService.generateFixtures(tournament.slug, { ...options, replace });
  };

  const removeAll = async () => {
    setIsBusy(true);
    const res = await matchService.deleteFixtures(tournament.slug);
    setIsBusy(false);
    setConfirm(null);
    if (res.ok) reload();
  };

  const removeMatch = async () => {
    setIsBusy(true);
    const res = await matchService.deleteMatch(confirm.match.id);
    setIsBusy(false);
    setConfirm(null);
    if (res.ok) reload();
  };

  const canScore = (match) =>
    [MATCH_STATUS.SCHEDULED, MATCH_STATUS.LIVE].includes(match.status) &&
    match.homeTeam &&
    match.awayTeam;

  const renderActions = (match) => (
    <div className="flex shrink-0 gap-1 pl-11 sm:pl-0">
      {canScore(match) && (
        <Link
          to={buildPath(ROUTES.MATCH_CONSOLE, { matchId: match.id })}
          aria-label={`Score match M${match.matchNumber}`}
          className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-link hover:bg-surface-muted"
        >
          <Timer className="size-4" aria-hidden="true" />
          {match.status === MATCH_STATUS.LIVE ? "Live" : "Score"}
        </Link>
      )}
      {match.status === MATCH_STATUS.SCHEDULED && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="px-2"
            aria-label={`Edit match M${match.matchNumber}`}
            onClick={() => setModal({ type: "match", match })}
            startIcon={<Pencil className="size-4" />}
          />
          <Button
            size="sm"
            variant="ghost"
            className="px-2 text-danger"
            aria-label={`Delete match M${match.matchNumber}`}
            onClick={() => setConfirm({ type: "match", match })}
            startIcon={<Trash2 className="size-4" />}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <CardNoticesCard tournamentId={tournament.slug} reloadKey={data.version} />
      <MatchSettingsCard tournament={tournament} onSaved={onTournamentSaved} />

      {usesGroups && (
        <GroupsEditor
          key={data.version}
          tournament={tournament}
          groupsData={groups}
          hasFixtures={hasFixtures}
          onChanged={reload}
        />
      )}

      <Card
        title="Fixtures"
        subtitle={`${readyTeams.length} teams ready (confirmed with a locked squad) · ${matches.length} matches`}
        actions={
          hasFixtures && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModal({ type: "schedule" })}
                startIcon={<CalendarClock className="size-4" />}
              >
                Schedule
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModal({ type: "match" })}
                startIcon={<Plus className="size-4" />}
              >
                Add match
              </Button>
            </div>
          )
        }
      >
        {!hasStarted && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-end">
            {ROUND_ROBIN_FORMATS.includes(format) && (
              <Select
                name="legs"
                label="Round robin"
                options={LEG_OPTIONS}
                value={options.legs}
                onChange={(_, legs) => setOptions((current) => ({ ...current, legs }))}
                className="sm:w-60"
              />
            )}
            {KNOCKOUT_FORMATS.includes(format) && (
              <Switch
                name="thirdPlace"
                label="Third-place match"
                checked={options.thirdPlace}
                onChange={(_, thirdPlace) => setOptions((current) => ({ ...current, thirdPlace }))}
              />
            )}
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              {hasFixtures && (
                <Button
                  variant="ghost"
                  className="text-danger"
                  onClick={() => setConfirm("deleteAll")}
                >
                  Delete all
                </Button>
              )}
              <Button
                loading={isBusy && !confirm}
                disabled={readyTeams.length < 2}
                onClick={() => generate(false)}
                startIcon={<Sparkles className="size-4" />}
              >
                {hasFixtures ? "Regenerate fixtures" : "Generate fixtures"}
              </Button>
            </div>
          </div>
        )}
        {readyTeams.length < 2 && !hasFixtures && (
          <p className="mb-3 text-sm text-fg-muted">
            Lock the squads of at least 2 confirmed teams (Teams tab) to generate fixtures.
          </p>
        )}
        {hasFixtures ? (
          <MatchList matches={matches} renderActions={renderActions} />
        ) : (
          <EmptyState
            title="No fixtures yet"
            description="Generate fixtures for the tournament format, then schedule them on your grounds."
          />
        )}
      </Card>

      <AwardsManager tournament={tournament} />

      {modal?.type === "schedule" && (
        <ScheduleModal
          tournament={tournament}
          grounds={grounds}
          onClose={() => setModal(null)}
          onScheduled={() => {
            setModal(null);
            reload();
          }}
        />
      )}
      {modal?.type === "match" && (
        <MatchFormModal
          tournament={tournament}
          match={modal.match}
          teams={readyTeams}
          grounds={grounds}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            reload();
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        loading={isBusy}
        {...(confirm === "replace" && {
          title: "Replace the fixtures?",
          message:
            "All current matches, times and grounds are deleted and new fixtures are created.",
          confirmText: "Replace fixtures",
          onConfirm: () => generate(true),
        })}
        {...(confirm === "deleteAll" && {
          title: "Delete all fixtures?",
          message: "Every match is removed. Groups stay as they are.",
          confirmText: "Delete all",
          onConfirm: removeAll,
        })}
        {...(confirm?.type === "match" && {
          title: `Delete match M${confirm.match.matchNumber}?`,
          message: "The match is removed from the fixtures.",
          confirmText: "Delete match",
          onConfirm: removeMatch,
        })}
      />
    </div>
  );
};

export default FixturesManager;
