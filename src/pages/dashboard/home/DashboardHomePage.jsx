import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle2, Circle, Trophy, UserPlus, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { ROUTES } from "@/constants/routes.constants";
import { ACCOUNT_ROLE, ACCOUNT_ROLE_LABEL } from "@/constants/user.constants";
import { selectCurrentUser } from "@/store/slices/authSlice";

const getProfileChecklist = (user) => [
  { label: "Add a profile photo", isDone: Boolean(user.photoUrl) },
  { label: "Choose your playing positions", isDone: user.positions.length > 0 },
  { label: "Add your date of birth", isDone: Boolean(user.dateOfBirth) },
  { label: "Add your city", isDone: Boolean(user.city) },
];

const MemberHome = ({ user }) => {
  const checklist = getProfileChecklist(user);
  const doneCount = checklist.filter((item) => item.isDone).length;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
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
      <Card title="My teams">
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="When a captain adds you to a team, it shows up here."
        />
      </Card>
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
    <Card title="Tournaments">
      <EmptyState
        icon={Trophy}
        title="Coming in the next phase"
        description="You'll create tournaments under organizers here."
      />
    </Card>
  </div>
);

const OrganizerHome = () => (
  <Card title="Your tournaments">
    <EmptyState
      icon={Trophy}
      title="No tournaments yet"
      description="An admin will create tournaments for you. They'll appear here to manage."
    />
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
