import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormInput from "@/components/ui/FormInput";
import ImageUploadField from "@/components/ui/ImageUploadField";
import PhoneInput from "@/components/ui/PhoneInput";
import PlaceSearch from "@/components/ui/PlaceSearch";
import Select from "@/components/ui/Select";
import Switch from "@/components/ui/Switch";
import Textarea from "@/components/ui/Textarea";
import useForm from "@/hooks/useForm";
import useTournamentCategories from "@/hooks/useTournamentCategories";
import { PLACE_SEARCH_TYPE } from "@/constants/place.constants";
import { TOURNAMENT_FORMAT_OPTIONS, TOURNAMENT_RULES } from "@/constants/tournament.constants";
import { ACCOUNT_ROLE } from "@/constants/user.constants";
import {
  TOURNAMENT_BANNER_COMPRESSION,
  TOURNAMENT_LOGO_COMPRESSION,
  UPLOAD_PURPOSE,
} from "@/constants/upload.constants";
import { updateTournament } from "@/services/tournament.service";
import { listUsers } from "@/services/user.service";
import { tournamentDetailsSchema } from "@/validations/tournament.schema";

const numberToInput = (value) => (value == null ? "" : String(value));

const toFormValues = (tournament) => ({
  name: tournament.name,
  description: tournament.description ?? "",
  venue: tournament.venue,
  venueDetails: tournament.venueDetails ?? "",
  contactPhone: tournament.contactPhone ?? "",
  tournamentFormat: tournament.tournamentFormat,
  gameFormatId: tournament.gameFormat?.id ?? null,
  ageGroupId: tournament.ageGroup?.id ?? null,
  genderCategoryId: tournament.genderCategory?.id ?? null,
  startDate: tournament.startDate ?? "",
  endDate: tournament.endDate ?? "",
  registrationDeadline: tournament.registrationDeadline ?? "",
  entryFee: numberToInput(tournament.entryFee),
  minTeams: numberToInput(tournament.minTeams),
  maxTeams: numberToInput(tournament.maxTeams),
  minSquadSize: numberToInput(tournament.minSquadSize),
  maxSquadSize: numberToInput(tournament.maxSquadSize),
  pointsWin: numberToInput(tournament.points.win),
  pointsDraw: numberToInput(tournament.points.draw),
  pointsLoss: numberToInput(tournament.points.loss),
  organizerId: tournament.organizer?.id ?? null,
  city: tournament.city,
  isStreamingEnabled: tournament.isStreamingEnabled,
});

// Parsed form values → API field names
const toPayload = (values) => ({
  name: values.name,
  description: values.description || null,
  venuePlaceId: values.venue?.id ?? null,
  venueDetails: values.venueDetails || null,
  contactPhone: values.contactPhone || null,
  tournamentFormat: values.tournamentFormat,
  gameFormatId: values.gameFormatId,
  ageGroupId: values.ageGroupId,
  genderCategoryId: values.genderCategoryId,
  startDate: values.startDate,
  endDate: values.endDate,
  registrationDeadline: values.registrationDeadline,
  entryFee: values.entryFee,
  minTeams: values.minTeams,
  maxTeams: values.maxTeams,
  minSquadSize: values.minSquadSize,
  maxSquadSize: values.maxSquadSize,
  pointsWin: values.pointsWin,
  pointsDraw: values.pointsDraw,
  pointsLoss: values.pointsLoss,
  organizerId: values.organizerId,
  cityPlaceId: values.city?.id,
  isStreamingEnabled: values.isStreamingEnabled,
});

// Only changed fields are sent, so locked or admin-only fields are never resubmitted unchanged
const pickChanges = (next, previous) =>
  Object.fromEntries(
    Object.entries(next).filter(
      ([key, value]) => JSON.stringify(value) !== JSON.stringify(previous[key]),
    ),
  );

const Section = ({ title, subtitle, children }) => (
  <Card title={title} subtitle={subtitle} bodyClassName="grid gap-4 sm:grid-cols-2">
    {children}
  </Card>
);

const TournamentDetailsForm = ({
  tournament,
  actor,
  isStructureLocked,
  statusErrors = {},
  onSaved,
}) => {
  const isAdmin = [ACCOUNT_ROLE.SUPERADMIN, ACCOUNT_ROLE.ADMIN].includes(actor.accountRole);
  const { gameFormatOptions, ageGroupOptions, genderOptions, categories } =
    useTournamentCategories();
  const [organizerOptions, setOrganizerOptions] = useState([]);
  const initialValues = toFormValues(tournament);
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    initialValues,
    tournamentDetailsSchema,
  );
  const fieldError = (name) => errors[name] ?? statusErrors[name];

  useEffect(() => {
    if (!isAdmin) return;
    listUsers({
      accountRole: ACCOUNT_ROLE.ORGANIZER,
      pageSize: 100,
      sortBy: "fullName",
      sortOrder: "asc",
    }).then((res) =>
      setOrganizerOptions(
        (res.ok ? res.data : []).map((user) => ({
          label: `${user.fullName} · ${user.email}`,
          value: user.id,
        })),
      ),
    );
  }, [isAdmin]);

  // Picking a game format suggests squad sizes when they are still empty
  const handleGameFormatChange = (name, value) => {
    handleChange(name, value);
    const format = categories?.gameFormats.find((item) => item.id === value);
    if (!format) return;
    if (!values.minSquadSize) handleChange("minSquadSize", String(format.defaultMinSquad));
    if (!values.maxSquadSize) handleChange("maxSquadSize", String(format.defaultMaxSquad));
  };

  const saveImage = async (field, key) => {
    const res = await updateTournament(tournament.slug, { [field]: key });
    if (res.ok) onSaved(res.data);
  };

  const onSubmit = handleSubmit(async (parsed) => {
    const initialPayload = toPayload(tournamentDetailsSchema.parse(initialValues));
    const changes = pickChanges(toPayload(parsed), initialPayload);
    if (!Object.keys(changes).length) return { ok: true };
    const res = await updateTournament(tournament.slug, changes);
    if (res.ok) onSaved(res.data);
    return res;
  });

  const lockHint = isStructureLocked ? "Locked after the tournament starts" : undefined;
  const numberProps = (name, label, extra = {}) => ({
    name,
    label,
    type: "number",
    inputMode: "numeric",
    value: values[name],
    onChange: handleChange,
    error: fieldError(name),
    ...extra,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Card
        title="Images"
        subtitle="Shown on the tournament page and cards"
        bodyClassName="flex flex-wrap gap-8"
      >
        <ImageUploadField
          label="Logo (square)"
          previewUrl={tournament.logoUrl}
          purpose={UPLOAD_PURPOSE.TOURNAMENT_LOGO}
          compression={TOURNAMENT_LOGO_COMPRESSION}
          entityId={tournament.slug}
          onUploaded={(key) => saveImage("logoKey", key)}
          onRemove={() => saveImage("logoKey", null)}
        />
        <ImageUploadField
          label="Banner (wide)"
          previewUrl={tournament.bannerUrl}
          purpose={UPLOAD_PURPOSE.TOURNAMENT_BANNER}
          compression={TOURNAMENT_BANNER_COMPRESSION}
          entityId={tournament.slug}
          onUploaded={(key) => saveImage("bannerKey", key)}
          onRemove={() => saveImage("bannerKey", null)}
          previewClassName="h-24 w-56 rounded-xl"
        />
      </Card>

      <Section title="Basics">
        <FormInput
          name="name"
          label="Tournament name"
          required
          value={values.name}
          onChange={handleChange}
          error={fieldError("name")}
          className="sm:col-span-2"
        />
        <Textarea
          name="description"
          label="About the tournament"
          rows={4}
          maxLength={TOURNAMENT_RULES.DESCRIPTION_MAX}
          value={values.description}
          onChange={handleChange}
          error={fieldError("description")}
          className="sm:col-span-2"
        />
        <PlaceSearch
          name="venue"
          label="Main venue"
          placeholder="Search the ground or venue"
          value={values.venue}
          onChange={handleChange}
          error={fieldError("venue") ?? fieldError("venuePlaceId")}
          className="sm:col-span-2"
        />
        <FormInput
          name="venueDetails"
          label="Venue directions (optional)"
          value={values.venueDetails}
          onChange={handleChange}
          error={fieldError("venueDetails")}
        />
        <PhoneInput
          name="contactPhone"
          label="Public contact number"
          value={values.contactPhone}
          onChange={handleChange}
          error={fieldError("contactPhone")}
        />
      </Section>

      <Section title="Format and category" subtitle={lockHint}>
        <Select
          name="tournamentFormat"
          label="Structure"
          options={TOURNAMENT_FORMAT_OPTIONS}
          value={values.tournamentFormat}
          onChange={handleChange}
          error={fieldError("tournamentFormat")}
          disabled={isStructureLocked}
        />
        <Select
          name="gameFormatId"
          label="Game format"
          options={gameFormatOptions}
          value={values.gameFormatId}
          onChange={handleGameFormatChange}
          error={fieldError("gameFormatId")}
          disabled={isStructureLocked}
        />
        <Select
          name="ageGroupId"
          label="Age group"
          options={ageGroupOptions}
          value={values.ageGroupId}
          onChange={handleChange}
          error={fieldError("ageGroupId")}
          disabled={isStructureLocked}
        />
        <Select
          name="genderCategoryId"
          label="Category"
          options={genderOptions}
          value={values.genderCategoryId}
          onChange={handleChange}
          error={fieldError("genderCategoryId")}
          disabled={isStructureLocked}
        />
      </Section>

      <Section title="Dates">
        <FormInput
          name="startDate"
          label="Start date"
          type="date"
          value={values.startDate}
          onChange={handleChange}
          error={fieldError("startDate")}
          disabled={isStructureLocked}
        />
        <FormInput
          name="endDate"
          label="End date"
          type="date"
          value={values.endDate}
          onChange={handleChange}
          error={fieldError("endDate")}
        />
        <FormInput
          name="registrationDeadline"
          label="Registration closes"
          type="date"
          value={values.registrationDeadline}
          onChange={handleChange}
          error={fieldError("registrationDeadline")}
        />
      </Section>

      <Section title="Teams, fee and points" subtitle={lockHint}>
        <FormInput
          {...numberProps("entryFee", "Entry fee per team (₹)", {
            helperText: "0 for a free tournament",
            disabled: isStructureLocked,
          })}
        />
        <div />
        <FormInput {...numberProps("minTeams", "Minimum teams", { disabled: isStructureLocked })} />
        <FormInput {...numberProps("maxTeams", "Maximum teams", { disabled: isStructureLocked })} />
        <FormInput
          {...numberProps("minSquadSize", "Minimum squad size", { disabled: isStructureLocked })}
        />
        <FormInput
          {...numberProps("maxSquadSize", "Maximum squad size", { disabled: isStructureLocked })}
        />
        <div className="grid grid-cols-3 gap-3 sm:col-span-2">
          <FormInput
            {...numberProps("pointsWin", "Points: win", { disabled: isStructureLocked })}
          />
          <FormInput
            {...numberProps("pointsDraw", "Points: draw", { disabled: isStructureLocked })}
          />
          <FormInput
            {...numberProps("pointsLoss", "Points: loss", { disabled: isStructureLocked })}
          />
        </div>
      </Section>

      {isAdmin && (
        <Card
          title="Admin settings"
          subtitle="Only admins can change these"
          actions={<Lock className="size-4 text-fg-muted" aria-hidden="true" />}
          bodyClassName="grid gap-4 sm:grid-cols-2"
        >
          <Select
            name="organizerId"
            label="Organizer"
            searchable
            options={organizerOptions}
            value={values.organizerId}
            onChange={handleChange}
            error={fieldError("organizerId")}
          />
          <PlaceSearch
            name="city"
            label="City"
            required
            type={PLACE_SEARCH_TYPE.CITY}
            value={values.city}
            onChange={handleChange}
            error={fieldError("city") ?? fieldError("cityPlaceId")}
          />
          <Switch
            name="isStreamingEnabled"
            label="Live streaming"
            description="Lets the organizer and media operators add YouTube streams"
            checked={values.isStreamingEnabled}
            onChange={handleChange}
            className="sm:col-span-2"
          />
        </Card>
      )}

      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-line bg-page/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="submit" loading={isSubmitting}>
          Save details
        </Button>
      </div>
    </form>
  );
};

export default TournamentDetailsForm;
