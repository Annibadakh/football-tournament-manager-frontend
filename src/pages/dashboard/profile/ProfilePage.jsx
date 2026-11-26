import { useSelector } from "react-redux";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import { ACCOUNT_ROLE_LABEL } from "@/constants/user.constants";
import { selectCurrentUser } from "@/store/slices/authSlice";
import PersonalDetailsCard from "@/pages/dashboard/profile/PersonalDetailsCard";
import PositionsCard from "@/pages/dashboard/profile/PositionsCard";
import ProfilePhotoCard from "@/pages/dashboard/profile/ProfilePhotoCard";

const ProfilePage = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <>
      <PageHeader
        title="My profile"
        subtitle="This is how teams, organizers and fans see you."
        actions={<Badge variant="brand">✔ Verified · {ACCOUNT_ROLE_LABEL[user.accountRole]}</Badge>}
      />
      <div className="flex max-w-3xl flex-col gap-6">
        <ProfilePhotoCard user={user} />
        <PersonalDetailsCard user={user} />
        <PositionsCard user={user} />
      </div>
    </>
  );
};

export default ProfilePage;
