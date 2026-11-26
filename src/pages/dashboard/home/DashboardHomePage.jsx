import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle2, Circle, Trophy, UserPlus } from "lucide-react";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { ROUTES } from "@/constants/routes.constants";
import { ACCOUNT_ROLE, ACCOUNT_ROLE_LABEL } from "@/constants/user.constants";
import { selectCurrentUser } from "@/store/slices/authSlice";
import InvitationsCard from "@/pages/dashboard/home/InvitationsCard";
import MyTeamsCard from "@/pages/dashboard/home/MyTeamsCard";

const getProfileChecklist = (user) => [
  { label: "Add a profile photo", isDone: Boolean(user.photoUrl) },
  { label: "Choose your playing positions", isDone: user.positions.length > 0 },
  { label: "Add your date of birth", isDone: Boolean(user.dateOfBirth) },
  { label: "Add your city", isDone: Boolean(user.city) },
];

const MemberHome = ({ user }) => {
  const checklist = getProfileChecklist(user);
  // Accepting an invitation adds a team, so My teams refreshes after a response
  const [teamsReloadKey, setTeamsReloadKey] = useState(0);
  const doneCount = checklist.filter((item) => item.isDone).length;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <InvitationsCard onResponded={() => setTeamsReloadKey((key) => key + 1)} />
      <Card
        title="Complete your profile"
        subtitle={`${doneCount} of ${checklist.length} done · teams see this when they add you`}
        actions={
          <Link to={ROUTES.PROFILE} className="text-sm font-semibold text-link hover:underline">
            Edit profile
          </Link>
        }
      >
        <ul className="flex flex-col gap-2">
          {checklist.map(({ label, isDone }) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              {isDone ? (
                <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
              ) : (
                <Circle className="size-4 text-fg-muted" aria-hidden="true" />
              )}
              <span className={isDone ? "text-fg-muted line-through" : "text-fg"}>{label}</span>
            </li>
          ))}
        </ul>
      </Card>
      <MyTeamsCard reloadKey={teamsReloadKey} />
    </div>
  );
};

const AdminHome = () => (
  <div className="grid gap-6 sm:grid-cols-2">
    <Card title="User management" subtitle="Create admins and organizers, block accounts">
      <Link
        to={ROUTES.USERS}
        className="inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline"
      >
        <UserPlus className="size-4" aria-hidden="true" />
        Go to users
      </Link>
    </Card>
    <Card title="Tournaments" subtitle="Create tournaments under organizers and track every event">
      <Link
        to={ROUTES.MANAGE_TOURNAMENTS}
        className="inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline"
      >
        <Trophy className="size-4" aria-hidden="true" />
        Go to tournaments
      </Link>
    </Card>
  </div>
);

const OrganizerHome = () => (
  <Card
    title="Your tournaments"
    subtitle="Complete details, add grounds and rules, and open registration"
  >
    <Link
      to={ROUTES.MANAGE_TOURNAMENTS}
      className="inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline"
    >
      <Trophy className="size-4" aria-hidden="true" />
      Manage my tournaments
    </Link>
  </Card>
);

const HOME_BY_ROLE = {
  [ACCOUNT_ROLE.SUPERADMIN]: AdminHome,
  [ACCOUNT_ROLE.ADMIN]: AdminHome,
  [ACCOUNT_ROLE.ORGANIZER]: OrganizerHome,
  [ACCOUNT_ROLE.MEMBER]: MemberHome,
};

const DashboardHomePage = () => {
  const user = useSelector(selectCurrentUser);
  const RoleHome = HOME_BY_ROLE[user.accountRole] ?? MemberHome;
  const firstName = user.fullName.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Hi, ${firstName}`}
        subtitle={`${ACCOUNT_ROLE_LABEL[user.accountRole]} dashboard`}
      />
      <RoleHome user={user} />
    </>
  );
};

export default DashboardHomePage;
