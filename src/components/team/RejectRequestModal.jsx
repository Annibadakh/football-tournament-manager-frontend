import { useState } from "react";
import FormModal from "@/components/ui/FormModal";
import Textarea from "@/components/ui/Textarea";
import { REVIEW_DECISION, TEAM_RULES } from "@/constants/team.constants";
import { reviewTeam } from "@/services/team.service";

const RejectRequestModal = ({ team, onClose, onDone }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFinalRequest = team.requestNumber >= 2;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const res = await reviewTeam(team.id, {
      decision: REVIEW_DECISION.REJECT,
      ...(reason.trim() && { reason: reason.trim() }),
    });
    setIsSubmitting(false);
    if (res.ok) onDone();
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title={`Reject ${team.name}?`}
      submitText="Reject request"
      submitVariant="danger"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <p className="text-sm text-fg-muted">
        {isFinalRequest
          ? "This is the captain's second request, so the decision is final."
          : "The captain can send one more request after this."}
      </p>
      <Textarea
        name="reason"
        label="Reason (shared with the captain)"
        rows={3}
        maxLength={TEAM_RULES.REJECTION_REASON_MAX}
        value={reason}
        onChange={(_, value) => setReason(value)}
      />
    </FormModal>
  );
};

export default RejectRequestModal;
