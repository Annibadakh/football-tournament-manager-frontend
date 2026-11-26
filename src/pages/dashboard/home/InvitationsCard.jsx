import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { INVITE_TYPE } from "@/constants/invite.constants";
import { listMyInvitations, respondToInvitation } from "@/services/invite.service";

const describeInvitation = (invitation) => {
  const { context } = invitation;
  if (!context) return { title: "Invitation", detail: "" };
  if (invitation.type === INVITE_TYPE.TEAM_JOIN) {
    return {
      title: `Join ${context.teamName}`,
      detail: `${context.tournament.name} · ${context.position} · jersey #${context.jerseyNumber}`,
    };
  }
  return {
    title: `${context.roleLabel} for ${context.tournament.name}`,
    detail: "Tournament staff",
  };
};

// Pending team and staff invitations; hidden when there are none
const InvitationsCard = ({ onResponded }) => {
  const [invitations, setInvitations] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    listMyInvitations().then((res) => setInvitations(res.ok ? res.data : []));
  }, [reloadCount]);

  const respond = async (invitation, accept) => {
    setBusyId(invitation.id);
    const res = await respondToInvitation(invitation.id, accept);
    setBusyId(null);
    if (!res.ok) return;
    setReloadCount((count) => count + 1);
    onResponded?.();
  };

  if (!invitations.length) return null;

  return (
    <Card
      title="Invitations"
      subtitle={`${invitations.length} waiting for your answer`}
      className="border-accent-300 lg:col-span-2"
    >
      <ul className="flex flex-col divide-y divide-line">
        {invitations.map((invitation) => {
          const { title, detail } = describeInvitation(invitation);
          return (
            <li key={invitation.id} className="flex flex-wrap items-center gap-3 py-3">
              <Mail className="size-5 text-accent-600" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-fg">{title}</p>
                <p className="text-sm text-fg-muted">
                  {detail}
                  {invitation.invitedBy && ` · from ${invitation.invitedBy}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  loading={busyId === invitation.id}
                  onClick={() => respond(invitation, true)}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busyId === invitation.id}
                  onClick={() => respond(invitation, false)}
                >
                  Decline
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

export default InvitationsCard;
