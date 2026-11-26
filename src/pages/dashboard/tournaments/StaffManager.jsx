import { useCallback, useEffect, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import StaffInviteModal from "@/components/team/StaffInviteModal";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { STAFF_ROLE, STAFF_ROLE_LABEL, STAFF_STATUS, TEAM_RULES } from "@/constants/team.constants";
import { listStaff, removeStaff } from "@/services/team.service";

const StaffManager = ({ tournament }) => {
  const [staff, setStaff] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    listStaff(tournament.slug).then((res) => setStaff(res.ok ? res.data : []));
  }, [tournament.slug, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  const handleRemove = async () => {
    setIsRemoving(true);
    const res = await removeStaff(tournament.slug, removing.id);
    setIsRemoving(false);
    setRemoving(null);
    if (res.ok) reload();
  };

  return (
    <Card
      title="Scorers and media operators"
      subtitle={`Up to ${TEAM_RULES.MAX_STAFF_PER_ROLE} of each. They can also play in this tournament.`}
      actions={
        <Button
          size="sm"
          onClick={() => setIsInviteOpen(true)}
          startIcon={<UserPlus className="size-4" />}
        >
          Invite
        </Button>
      }
    >
      {!staff && <Skeleton className="h-24 w-full rounded-xl" />}
      {staff?.length === 0 && (
        <EmptyState
          title="No staff yet"
          description="Invite scorers to run live scores, and media operators for live streams."
        />
      )}
      {staff?.length > 0 &&
        Object.values(STAFF_ROLE).map((role) => {
          const members = staff.filter((item) => item.staffRole === role);
          return (
            <div key={role} className="mb-4 last:mb-0">
              <p className="mb-2 text-xs font-semibold text-fg-muted">
                {STAFF_ROLE_LABEL[role]}s ({members.length}/{TEAM_RULES.MAX_STAFF_PER_ROLE})
              </p>
              <ul className="flex flex-col gap-2">
                {members.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-line px-3 py-2"
                  >
                    <Avatar src={item.person.photoUrl} name={item.person.fullName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-fg">
                        {item.person.fullName}
                      </p>
                      <p className="truncate text-xs text-fg-muted">{item.email}</p>
                    </div>
                    {item.status === STAFF_STATUS.INVITED ? (
                      <Badge variant="warning" size="sm">
                        Invite pending
                      </Badge>
                    ) : (
                      <Badge variant="brand" size="sm">
                        Active
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="px-2 text-danger"
                      aria-label={`Remove ${item.person.fullName}`}
                      onClick={() => setRemoving(item)}
                      startIcon={<Trash2 className="size-4" />}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      <StaffInviteModal
        open={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        tournamentId={tournament.slug}
        onInvited={reload}
      />
      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        loading={isRemoving}
        title={`Remove ${removing?.person.fullName}?`}
        message="They lose access to scoring or streaming for this tournament."
        confirmText="Remove"
      />
    </Card>
  );
};

export default StaffManager;
