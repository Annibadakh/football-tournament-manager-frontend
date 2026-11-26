import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import Modal from "@/components/ui/Modal";
import PlaceSearch from "@/components/ui/PlaceSearch";
import Select from "@/components/ui/Select";
import Switch from "@/components/ui/Switch";
import useForm from "@/hooks/useForm";
import { PLACE_SEARCH_TYPE } from "@/constants/place.constants";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { ACCOUNT_ROLE, ACCOUNT_STATUS_LABEL } from "@/constants/user.constants";
import { createTournament } from "@/services/tournament.service";
import { listUsers } from "@/services/user.service";
import { createTournamentSchema } from "@/validations/tournament.schema";

const FORM_ID = "create-tournament-form";
const INITIAL_VALUES = { name: "", organizerId: null, city: null, isStreamingEnabled: false };
const MAX_ORGANIZER_OPTIONS = 100;

// Admin step: only the basics; the organizer completes the rest
const CreateTournamentModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [organizerOptions, setOrganizerOptions] = useState(null);
  const { values, setValues, errors, setErrors, isSubmitting, handleChange, handleSubmit } =
    useForm(INITIAL_VALUES, createTournamentSchema);

  useEffect(() => {
    if (!open || organizerOptions) return;
    listUsers({
      accountRole: ACCOUNT_ROLE.ORGANIZER,
      pageSize: MAX_ORGANIZER_OPTIONS,
      sortBy: "fullName",
      sortOrder: "asc",
    }).then((res) =>
      setOrganizerOptions(
        (res.ok ? res.data : []).map((user) => ({
          label: `${user.fullName} · ${user.email} (${ACCOUNT_STATUS_LABEL[user.accountStatus]})`,
          value: user.id,
        })),
      ),
    );
  }, [open, organizerOptions]);

  const handleClose = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    onClose();
  };

  const onSubmit = handleSubmit(async ({ name, organizerId, city, isStreamingEnabled }) => {
    const res = await createTournament({
      name,
      organizerId,
      cityPlaceId: city.id,
      isStreamingEnabled,
    });
    if (res.ok) navigate(buildPath(ROUTES.MANAGE_TOURNAMENT, { tournamentId: res.data.slug }));
    return res;
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create tournament"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={isSubmitting}>
            Create as draft
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormInput
          name="name"
          label="Tournament name"
          required
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Select
          name="organizerId"
          label="Organizer"
          required
          searchable
          loading={!organizerOptions}
          options={organizerOptions ?? []}
          value={values.organizerId}
          onChange={handleChange}
          error={errors.organizerId}
          emptyMessage="No organizers yet. Invite one from Users."
        />
        <PlaceSearch
          name="city"
          label="City"
          required
          type={PLACE_SEARCH_TYPE.CITY}
          placeholder="Search a city or town"
          value={values.city}
          onChange={handleChange}
          error={errors.city}
        />
        <Switch
          name="isStreamingEnabled"
          label="Live streaming"
          description="Lets the organizer and media operators add YouTube streams"
          checked={values.isStreamingEnabled}
          onChange={handleChange}
        />
      </form>
    </Modal>
  );
};

export default CreateTournamentModal;
