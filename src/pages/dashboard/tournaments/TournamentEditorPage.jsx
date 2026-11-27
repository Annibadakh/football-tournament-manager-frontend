import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ExternalLink, Trophy } from "lucide-react";
import TournamentStatusBadge from "@/components/tournament/TournamentStatusBadge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import PageLoader from "@/components/ui/PageLoader";
import Tabs from "@/components/ui/Tabs";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import {
  STATUS_TRANSITIONS,
  STRUCTURE_LOCKED_STATUSES,
  TOURNAMENT_STATUS,
  TOURNAMENT_STATUS_ACTION,
} from "@/constants/tournament.constants";
import { changeTournamentStatus, getTournament } from "@/services/tournament.service";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { apiErrorsToFieldErrors } from "@/utils/form";
import FixturesManager from "@/pages/dashboard/tournaments/fixtures/FixturesManager";
import GroundsEditor from "@/pages/dashboard/tournaments/GroundsEditor";
import RuleBookEditor from "@/pages/dashboard/tournaments/RuleBookEditor";
import StaffManager from "@/pages/dashboard/tournaments/StaffManager";
import TeamsManager from "@/pages/dashboard/tournaments/TeamsManager";
import TournamentDetailsForm from "@/pages/dashboard/tournaments/TournamentDetailsForm";

const TABS = [
  { value: "details", label: "Details" },
  { value: "teams", label: "Teams" },
  { value: "fixtures", label: "Fixtures" },
  { value: "staff", label: "Staff" },
  { value: "grounds", label: "Grounds" },
  { value: "rules", label: "Rule book" },
];

const DANGER_STATUSES = [TOURNAMENT_STATUS.CANCELLED, TOURNAMENT_STATUS.DRAFT];

const STATUS_CONFIRM_MESSAGE = {
  [TOURNAMENT_STATUS.REGISTRATION_OPEN]:
    "The tournament becomes public: it appears in search and its page can be shared.",
  [TOURNAMENT_STATUS.DRAFT]: "The tournament will be hidden from the public again.",
  [TOURNAMENT_STATUS.ONGOING]: "Format, categories, team limits, fee and points get locked.",
  [TOURNAMENT_STATUS.COMPLETED]: "The tournament is marked as finished. This can't be undone.",
  [TOURNAMENT_STATUS.CANCELLED]: "The tournament is cancelled. This can't be undone.",
};

const TournamentEditorPage = () => {
  const { tournamentId } = useParams();
  const actor = useSelector(selectCurrentUser);
  const [tournament, setTournament] = useState(undefined);
  const [tab, setTab] = useState("details");
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusErrors, setStatusErrors] = useState({});
  // Remounts the details form with fresh values after the server returns an updated tournament
  const [formVersion, setFormVersion] = useState(0);

  useEffect(() => {
    getTournament(tournamentId, { errorToast: false }).then((res) =>
      setTournament(res.ok ? res.data : null),
    );
  }, [tournamentId]);

  const handleSaved = (updated) => {
    setTournament(updated);
    setStatusErrors({});
    setFormVersion((version) => version + 1);
  };

  const confirmStatusChange = async () => {
    setIsChangingStatus(true);
    const res = await changeTournamentStatus(tournament.slug, pendingStatus);
    setIsChangingStatus(false);
    setPendingStatus(null);
    if (res.ok) {
      handleSaved(res.data);
      return;
    }
    // Missing details for opening registration are highlighted on the Details tab
    setStatusErrors(apiErrorsToFieldErrors(res.errors));
    setTab("details");
  };

  if (tournament === undefined) return <PageLoader label="Loading tournament..." />;
  if (!tournament) {
    return (
      <EmptyState
        icon={Trophy}
        title="Tournament not found"
        description="It doesn't exist or you don't manage it."
        action={
          <Link to={ROUTES.MANAGE_TOURNAMENTS} className="font-semibold text-link hover:underline">
            Back to tournaments
          </Link>
        }
      />
    );
  }

  const nextStatuses = STATUS_TRANSITIONS[tournament.status];
  const isStructureLocked = STRUCTURE_LOCKED_STATUSES.includes(tournament.status);

  return (
    <>
      <PageHeader
        title={tournament.name}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <TournamentStatusBadge status={tournament.status} size="sm" />
            {tournament.status !== TOURNAMENT_STATUS.DRAFT && (
              <Link
                to={buildPath(ROUTES.TOURNAMENT, { tournamentId: tournament.slug })}
                className="inline-flex items-center gap-1 font-semibold text-link hover:underline"
                target="_blank"
              >
                View public page <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            )}
          </span>
        }
        actions={nextStatuses.map((status) => (
          <Button
            key={status}
            variant={DANGER_STATUSES.includes(status) ? "ghost" : "primary"}
            onClick={() => setPendingStatus(status)}
          >
            {TOURNAMENT_STATUS_ACTION[status]}
          </Button>
        ))}
      />
      <Tabs items={TABS} value={tab} onChange={setTab} className="mb-6" />
      {tab === "details" && (
        <TournamentDetailsForm
          key={formVersion}
          tournament={tournament}
          actor={actor}
          isStructureLocked={isStructureLocked}
          statusErrors={statusErrors}
          onSaved={handleSaved}
        />
      )}
      {tab === "teams" && <TeamsManager tournament={tournament} />}
      {tab === "fixtures" && (
        <FixturesManager tournament={tournament} onTournamentSaved={handleSaved} />
      )}
      {tab === "staff" && <StaffManager tournament={tournament} />}
      {tab === "grounds" && <GroundsEditor tournamentId={tournament.slug} />}
      {tab === "rules" && <RuleBookEditor tournamentId={tournament.slug} />}
      <ConfirmDialog
        open={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={confirmStatusChange}
        loading={isChangingStatus}
        variant={DANGER_STATUSES.includes(pendingStatus) ? "danger" : "primary"}
        title={`${TOURNAMENT_STATUS_ACTION[pendingStatus] ?? ""}?`}
        message={STATUS_CONFIRM_MESSAGE[pendingStatus]}
        confirmText={TOURNAMENT_STATUS_ACTION[pendingStatus]}
      />
    </>
  );
};

export default TournamentEditorPage;
