import FormInput from "@/components/ui/FormInput";
import FormModal from "@/components/ui/FormModal";
import Select from "@/components/ui/Select";
import useForm from "@/hooks/useForm";
import { OFFLINE_PAYMENT_MODE_OPTIONS, PAYMENT_RULES } from "@/constants/payment.constants";
import { recordOfflinePayment } from "@/services/payment.service";
import { offlinePaymentSchema } from "@/validations/payment.schema";

// Organizer/admin records an entry fee paid outside the app; this confirms the team
const OfflinePaymentModal = ({ team, entryFee, onClose, onRecorded }) => {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { amount: entryFee ?? "", mode: null, reference: "" },
    offlinePaymentSchema,
  );

  const onSubmit = handleSubmit(async (data) => {
    const res = await recordOfflinePayment(team.id, data);
    if (res.ok) onRecorded(res.data);
    return res;
  });

  return (
    <FormModal
      open
      onClose={onClose}
      title={`Record payment for ${team.name}`}
      submitText="Record & confirm team"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    >
      <p className="text-sm text-fg-muted">
        Use this when the captain paid you directly. The team is confirmed and a receipt is created.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormInput
          name="amount"
          label="Amount received (₹)"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          required
          value={values.amount}
          onChange={handleChange}
          error={errors.amount}
        />
        <Select
          name="mode"
          label="Paid by"
          required
          options={OFFLINE_PAYMENT_MODE_OPTIONS}
          value={values.mode}
          onChange={handleChange}
          error={errors.mode}
        />
      </div>
      <FormInput
        name="reference"
        label="Reference (optional)"
        placeholder="UTR number, cheque no. or a note"
        maxLength={PAYMENT_RULES.REFERENCE_MAX_LENGTH}
        value={values.reference}
        onChange={handleChange}
        error={errors.reference}
      />
    </FormModal>
  );
};

export default OfflinePaymentModal;
