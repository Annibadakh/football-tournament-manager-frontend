import { useState } from "react";
import FormInput from "@/components/ui/FormInput";
import FormModal from "@/components/ui/FormModal";
import Switch from "@/components/ui/Switch";
import { scheduleMatches } from "@/services/match.service";
import { apiErrorsToFieldErrors } from "@/utils/form";

// Slot = two halves + break, rounded up to 5 minutes
const defaultSlot = (halfMinutes) => Math.ceil((halfMinutes * 2 + 15) / 5) * 5;

// Fills kick-off times and grounds for matches without a time (or all, when rescheduling)
const ScheduleModal = ({ tournament, grounds, onClose, onScheduled }) => {
  const [values, setValues] = useState({
    startDate: tournament.startDate ?? "",
    firstKickoff: "08:00",
    lastKickoff: "17:00",
    slotMinutes: String(defaultSlot(tournament.matchSettings.halfMinutes)),
  });
  const [selectedGrounds, setSelectedGrounds] = useState(grounds.map((ground) => ground.id));
  const [reschedule, setReschedule] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  const toggleGround = (groundId, isOn) =>
    setSelectedGrounds((current) =>
      isOn ? [...current, groundId] : current.filter((id) => id !== groundId),
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedGrounds.length) return setErrors({ groundIds: "Choose at least one ground" });
    setIsSubmitting(true);
    const res = await scheduleMatches(tournament.slug, {
      ...values,
      slotMinutes: Number(values.slotMinutes),
      groundIds: selectedGrounds,
      reschedule,
    });
    setIsSubmitting(false);
    if (res.ok) onScheduled();
    else setErrors(apiErrorsToFieldErrors(res.errors));
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title="Schedule matches"
      submitText="Schedule"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <p className="text-sm text-fg-muted">
        Matches are placed round by round in Indian time. No team plays two matches at once and
        grounds are never double-booked.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormInput
          name="startDate"
          label="Start date"
          type="date"
          required
          value={values.startDate}
          onChange={handleChange}
          error={errors.startDate}
        />
        <FormInput
          name="slotMinutes"
          label="Minutes per slot"
          type="number"
          min={10}
          max={300}
          required
          value={values.slotMinutes}
          onChange={handleChange}
          error={errors.slotMinutes}
        />
        <FormInput
          name="firstKickoff"
          label="First kick-off each day"
          type="time"
          required
          value={values.firstKickoff}
          onChange={handleChange}
          error={errors.firstKickoff}
        />
        <FormInput
          name="lastKickoff"
          label="Last kick-off each day"
          type="time"
          required
          value={values.lastKickoff}
          onChange={handleChange}
          error={errors.lastKickoff}
        />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-fg">Grounds</legend>
        {grounds.map((ground) => (
          <Switch
            key={ground.id}
            name={`ground-${ground.id}`}
            label={ground.name}
            checked={selectedGrounds.includes(ground.id)}
            onChange={(_, isOn) => toggleGround(ground.id, isOn)}
          />
        ))}
        {errors.groundIds && <p className="text-xs text-danger">{errors.groundIds}</p>}
      </fieldset>
      <Switch
        name="reschedule"
        label="Reschedule matches that already have a time"
        description="Off: only matches without a time are scheduled"
        checked={reschedule}
        onChange={(_, isOn) => setReschedule(isOn)}
      />
    </FormModal>
  );
};

export default ScheduleModal;
