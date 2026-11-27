import { useEffect, useState } from "react";
import FixturesSection from "@/pages/public/tournament-details/FixturesSection";
import StreamsSection from "@/pages/public/tournament-details/StreamsSection";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CalendarClock,
  CalendarDays,
  ExternalLink,
  MapPin,
  Phone,
  Radio,
  ScrollText,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import logoIcon from "@/assets/brand/maidaan-icon.svg";
import TeamRequestModal from "@/components/team/TeamRequestModal";
import TournamentStatusBadge from "@/components/tournament/TournamentStatusBadge";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";
import { buildMapsUrl } from "@/constants/place.constants";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { TOURNAMENT_FORMAT_LABEL, TOURNAMENT_STATUS } from "@/constants/tournament.constants";
import { ACCOUNT_ROLE, ACCOUNT_STATUS, PHONE_PREFIX } from "@/constants/user.constants";
import { listTournamentTeams } from "@/services/team.service";
import { getTournament, listGrounds, listTournamentRules } from "@/services/tournament.service";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { formatDate, todayIsoDate } from "@/utils/date";
import { formatCategories, formatDateRange, formatEntryFee } from "@/utils/tournament";

const Fact = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200">
      <Icon className="size-4" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-fg-muted">{label}</p>
      <p className="text-sm text-fg">{value}</p>
    </div>
  </div>
);

const PlaceLink = ({ place }) => (
  <a
    href={buildMapsUrl(place)}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center gap-1 font-semibold text-link hover:underline"
  >
    Open in Maps <ExternalLink className="size-3.5" aria-hidden="true" />
  </a>
);

// Registration is open until the deadline day ends (dates are calendar days)
const isRegistrationOpen = (tournament) =>
  tournament.status === TOURNAMENT_STATUS.REGISTRATION_OPEN &&
  (!tournament.registrationDeadline || tournament.registrationDeadline >= todayIsoDate());

const RegisterTeamButton = ({ tournament }) => {
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const [isOpen, setIsOpen] = useState(false);

  if (!isRegistrationOpen(tournament)) return null;
  if (!user) {
    return (
      <Link
        to={ROUTES.LOGIN}
        state={{ from: location }}
        className="inline-flex h-10 items-center rounded-lg bg-accent-500 px-4 text-sm font-semibold text-ink-950 hover:bg-accent-400"
      >
        Log in to register your team
      </Link>
    );
  }
  if (user.accountRole !== ACCOUNT_ROLE.MEMBER) return null;
  // Unverified players finish verification first instead of hitting an API error
  if (user.accountStatus !== ACCOUNT_STATUS.VERIFIED) {
    return (
      <Link
        to={ROUTES.VERIFY_ACCOUNT}
        className="inline-flex h-10 items-center rounded-lg bg-accent-500 px-4 text-sm font-semibold text-ink-950 hover:bg-accent-400"
      >
        Verify your account to register a team
      </Link>
    );
  }
  return (
    <>
      <Button
        variant="accent"
        onClick={() => setIsOpen(true)}
        startIcon={<Shield className="size-4" />}
      >
        Register your team
      </Button>
      <TeamRequestModal open={isOpen} onClose={() => setIsOpen(false)} tournament={tournament} />
    </>
  );
};

const TeamsCard = ({ teams }) => (
  <Card title="Teams" subtitle={`${teams.length} confirmed`}>
    {teams.length === 0 ? (
      <p className="text-sm text-fg-muted">No confirmed teams yet.</p>
    ) : (
      <ul className="grid gap-2 sm:grid-cols-2">
        {teams.map((team) => (
          <li key={team.id}>
            <Link
              to={buildPath(ROUTES.TEAM, { teamId: team.id })}
              className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 hover:bg-surface-muted"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white">
                {team.shortName}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-fg">{team.name}</span>
                <span className="block text-xs text-fg-muted">
                  {team.squadCount} players · Captain {team.captain?.fullName}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </Card>
);

const TournamentDetailsPage = () => {
  const { tournamentId } = useParams();
  const [state, setState] = useState({
    isLoading: true,
    tournament: null,
    grounds: [],
    rules: [],
    teams: [],
  });

  useEffect(() => {
    let isCurrent = true;
    // Independent requests run in parallel
    Promise.all([
      getTournament(tournamentId, { errorToast: false }),
      listGrounds(tournamentId),
      listTournamentRules(tournamentId),
      listTournamentTeams(tournamentId),
    ]).then(([tournamentRes, groundsRes, rulesRes, teamsRes]) => {
      if (!isCurrent) return;
      setState({
        isLoading: false,
        tournament: tournamentRes.ok ? tournamentRes.data : null,
        grounds: groundsRes.ok ? groundsRes.data : [],
        rules: rulesRes.ok ? rulesRes.data : [],
        teams: teamsRes.ok ? teamsRes.data : [],
      });
    });
    return () => {
      isCurrent = false;
    };
  }, [tournamentId]);

  if (state.isLoading) return <PageLoader label="Loading tournament..." />;
  const { tournament, grounds, rules, teams } = state;
  if (!tournament) {
    return (
      <EmptyState
        icon={Trophy}
        title="Tournament not found"
        description="It may have been removed or isn't public yet."
        action={
          <Link to={ROUTES.TOURNAMENTS} className="font-semibold text-link hover:underline">
            Browse tournaments
          </Link>
        }
        className="min-h-[60vh]"
      />
    );
  }

  const categories = formatCategories(tournament);

  return (
    <div className="pb-12">
      <div className="h-40 bg-brand-700 sm:h-56">
        {tournament.bannerUrl && (
          <img src={tournament.bannerUrl} alt="" className="size-full object-cover" />
        )}
      </div>
      <div className="mx-auto max-w-6xl px-4">
        {/* Only the logo overlaps the banner so the title always sits on the page background */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
          <img
            src={tournament.logoUrl ?? logoIcon}
            alt={`${tournament.name} logo`}
            className="-mt-12 size-24 rounded-2xl border-4 border-page bg-surface object-cover sm:-mt-14 sm:size-28"
          />
          <div className="min-w-0 flex-1 sm:pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <TournamentStatusBadge status={tournament.status} />
              {tournament.isStreamingEnabled && (
                <Badge variant="info" icon={<Radio className="size-3" />}>
                  Live streams
                </Badge>
              )}
            </div>
            <h1 className="mt-2 text-3xl leading-tight text-fg sm:text-4xl">{tournament.name}</h1>
            {categories && <p className="mt-1 text-fg-muted">{categories}</p>}
          </div>
          <div className="sm:pt-4">
            <RegisterTeamButton tournament={tournament} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            {tournament.isStreamingEnabled && <StreamsSection tournamentId={tournament.slug} />}
            <FixturesSection tournamentId={tournament.slug} />
            <Card title="Overview">
              <div className="grid gap-4 sm:grid-cols-2">
                <Fact
                  icon={CalendarDays}
                  label="Dates"
                  value={formatDateRange(tournament.startDate, tournament.endDate)}
                />
                <Fact
                  icon={CalendarClock}
                  label="Registration closes"
                  value={
                    tournament.registrationDeadline
                      ? formatDate(tournament.registrationDeadline)
                      : "To be announced"
                  }
                />
                <Fact
                  icon={Trophy}
                  label="Format"
                  value={TOURNAMENT_FORMAT_LABEL[tournament.tournamentFormat] ?? "To be announced"}
                />
                <Fact
                  icon={Users}
                  label="Teams"
                  value={
                    tournament.maxTeams
                      ? `${tournament.minTeams}–${tournament.maxTeams} teams`
                      : "To be announced"
                  }
                />
                <Fact
                  icon={ScrollText}
                  label="Entry fee"
                  value={formatEntryFee(tournament.entryFee)}
                />
                <Fact
                  icon={Users}
                  label="Squad size"
                  value={
                    tournament.maxSquadSize
                      ? `${tournament.minSquadSize}–${tournament.maxSquadSize} players`
                      : "To be announced"
                  }
                />
              </div>
              {tournament.description && (
                <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-fg">
                  {tournament.description}
                </p>
              )}
            </Card>

            <TeamsCard teams={teams} />

            <Card title="Rule book" subtitle={`${rules.length} rules`}>
              {rules.length === 0 ? (
                <p className="text-sm text-fg-muted">
                  The organizer hasn&apos;t published rules yet.
                </p>
              ) : (
                <ol className="flex flex-col gap-4">
                  {rules.map((rule, index) => (
                    <li key={rule.id} className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-fg">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-fg">{rule.title}</p>
                        <p className="text-sm text-fg-muted">{rule.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card title="Venue">
              {tournament.venue ? (
                <div className="flex flex-col gap-2 text-sm">
                  <p className="flex items-start gap-2 font-semibold text-fg">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {tournament.venue.name}
                  </p>
                  <p className="text-fg-muted">{tournament.venue.formattedAddress}</p>
                  {tournament.venueDetails && (
                    <p className="text-fg-muted">{tournament.venueDetails}</p>
                  )}
                  <PlaceLink place={tournament.venue} />
                </div>
              ) : (
                <p className="text-sm text-fg-muted">
                  {tournament.city?.name ?? "Venue to be announced"}
                </p>
              )}
              {grounds.length > 0 && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="mb-2 text-xs font-semibold text-fg-muted">Grounds</p>
                  <ul className="flex flex-col gap-2 text-sm">
                    {grounds.map((ground) => (
                      <li key={ground.id} className="flex items-center justify-between gap-2">
                        <span className="text-fg">{ground.name}</span>
                        {ground.place && <PlaceLink place={ground.place} />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <Card title="Organizer">
              <div className="flex items-center gap-3">
                <Avatar
                  src={tournament.organizer?.photoUrl}
                  name={tournament.organizer?.fullName}
                />
                <p className="font-semibold text-fg">{tournament.organizer?.fullName}</p>
              </div>
              {tournament.contactPhone && (
                <a
                  href={`tel:${PHONE_PREFIX}${tournament.contactPhone}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-link"
                >
                  <Phone className="size-4" aria-hidden="true" /> {PHONE_PREFIX}{" "}
                  {tournament.contactPhone}
                </a>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailsPage;
