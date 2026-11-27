import { useState } from "react";
import { toast } from "sonner";
import FormInput from "@/components/ui/FormInput";
import FormModal from "@/components/ui/FormModal";
import Select from "@/components/ui/Select";
import { STREAM_RULES } from "@/constants/stream.constants";
import { createStream, updateStream } from "@/services/stream.service";
import { apiErrorsToFieldErrors } from "@/utils/form";
import { fromIstInputValue, sideLabel, toIstInputValue } from "@/utils/match";

const matchOption = (match) => ({
  label: `M${match.matchNumber} · ${sideLabel(match, "home")} v ${sideLabel(match, "away")}`,
  value: match.id,
});

// Add or edit a stream: YouTube link, optional title, time and match
const StreamFormModal = ({
  tournamentId,
  stream = null,
  matches,
  takenMatchIds,
  onClose,
  onSaved,
}) => {
  const isEdit = Boolean(stream);
  const [values, setValues] = useState({
    url: stream?.watchUrl ?? "",
    title: stream?.title ?? "",
    scheduled: toIstInputValue(stream?.scheduledAt),
    matchId: stream?.match?.id ?? null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };
  const options = matches
    .filter((match) => match.id === values.matchId || !takenMatchIds.has(match.id))
    .map(matchOption);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.url.trim()) return setErrors({ url: "Paste the YouTube link" });
    const payload = {
      url: values.url.trim(),
      ...(values.title.trim() && { title: values.title.trim() }),
      scheduledAt: fromIstInputValue(values.scheduled),
      ...(isEdit ? { matchId: values.matchId } : values.matchId && { matchId: values.matchId }),
    };
    if (!isEdit && !payload.scheduledAt) delete payload.scheduledAt;
    // Unchanged link: don't re-check YouTube
    if (isEdit && payload.url === stream.watchUrl) delete payload.url;
    setIsSubmitting(true);
    const res = isEdit
      ? await updateStream(stream.id, payload)
      : await createStream(tournamentId, payload);
    setIsSubmitting(false);
    if (!res.ok) return setErrors(apiErrorsToFieldErrors(res.errors));
    res.data.warnings.forEach((warning) => toast.warning(warning));
    onSaved();
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title={isEdit ? "Edit stream" : "Add a stream"}
      submitText={isEdit ? "Save stream" : "Add stream"}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <FormInput
        name="url"
        label="YouTube link"
        required
        placeholder="https://youtube.com/live/… or https://youtu.be/…"
        maxLength={STREAM_RULES.URL_MAX}
        value={values.url}
        onChange={handleChange}
        error={errors.url}
        helperText="Create the live stream on YouTube first, then paste its link"
      />
      <FormInput
        name="title"
        label="Title (optional)"
        placeholder="Uses the match or the YouTube title when empty"
        maxLength={STREAM_RULES.TITLE_MAX}
        value={values.title}
        onChange={handleChange}
        error={errors.title}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="matchId"
          label="Match (optional)"
          clearable
          searchable
          placeholder="Tournament stream (ceremony, event…)"
          options={options}
          value={values.matchId}
          onChange={handleChange}
          error={errors.matchId}
        />
        <FormInput
          name="scheduled"
          label="Starts at (IST)"
          type="datetime-local"
          value={values.scheduled}
          onChange={handleChange}
          error={errors.scheduledAt}
          helperText="A match stream uses the kick-off when empty"
        />
      </div>
    </FormModal>
  );
};

export default StreamFormModal;
