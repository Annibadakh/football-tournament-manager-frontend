import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormInput from "@/components/ui/FormInput";
import { updateTournament } from "@/services/tournament.service";
import { apiErrorsToFieldErrors } from "@/utils/form";

const toNumber = (value) => (value === "" ? null : Number(value));

// Half lengths drive the live clock and clash checks; the card threshold drives notices
const MatchSettingsCard = ({ tournament, onSaved }) => {
  const settings = tournament.matchSettings;
  const [values, setValues] = useState({
    halfMinutes: String(settings.halfMinutes),
    extraTimeHalfMinutes: String(settings.extraTimeHalfMinutes),
    yellowCardNoticeThreshold: String(settings.yellowCardNoticeThreshold),
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const handleChange = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  const save = async () => {
    setIsSaving(true);
    const res = await updateTournament(tournament.slug, {
      halfMinutes: toNumber(values.halfMinutes),
      extraTimeHalfMinutes: toNumber(values.extraTimeHalfMinutes),
      yellowCardNoticeThreshold: toNumber(values.yellowCardNoticeThreshold) ?? 2,
    });
    setIsSaving(false);
    if (res.ok) {
      setErrors({});
      onSaved(res.data);
    } else setErrors(apiErrorsToFieldErrors(res.errors));
  };

  return (
    <Card
      title="Match settings"
      subtitle={`A match slot is ${Number(values.halfMinutes || 0) * 2 + 15} minutes (two halves + 15)`}
      actions={
        <Button size="sm" variant="outline" loading={isSaving} onClick={save}>
          Save
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <FormInput
          name="halfMinutes"
          label="Half length (min)"
          type="number"
          min={5}
          max={60}
          value={values.halfMinutes}
          onChange={handleChange}
          error={errors.halfMinutes}
        />
        <FormInput
          name="extraTimeHalfMinutes"
          label="Extra-time half (min)"
          type="number"
          min={1}
          max={30}
          value={values.extraTimeHalfMinutes}
          onChange={handleChange}
          error={errors.extraTimeHalfMinutes}
        />
        <FormInput
          name="yellowCardNoticeThreshold"
          label="Yellow cards for a notice"
          type="number"
          min={1}
          max={10}
          value={values.yellowCardNoticeThreshold}
          onChange={handleChange}
          error={errors.yellowCardNoticeThreshold}
        />
      </div>
    </Card>
  );
};

export default MatchSettingsCard;
