import { useDispatch } from "react-redux";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormInput from "@/components/ui/FormInput";
import PlaceSearch from "@/components/ui/PlaceSearch";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import useForm from "@/hooks/useForm";
import { PLACE_SEARCH_TYPE } from "@/constants/place.constants";
import { GENDER_OPTIONS, PHONE_PREFIX, USER_RULES } from "@/constants/user.constants";
import { updateMyProfile } from "@/services/me.service";
import { setUser } from "@/store/slices/authSlice";
import { profileSchema } from "@/validations/user.schema";

const toFormValues = (user) => ({
  fullName: user.fullName,
  dateOfBirth: user.dateOfBirth ?? "",
  gender: user.gender,
  city: user.city ?? null,
  bio: user.bio ?? "",
});

// Empty optional fields are sent as null so the API clears them
const toPayload = (values) => ({
  fullName: values.fullName,
  dateOfBirth: values.dateOfBirth || null,
  gender: values.gender,
  cityPlaceId: values.city?.id ?? null,
  bio: values.bio || null,
});

const ReadOnlyField = ({ label, value }) => (
  <div className="rounded-lg border border-line bg-surface-muted px-3 py-2">
    <p className="text-xs font-semibold text-fg-muted">{label}</p>
    <p className="truncate text-sm text-fg">{value}</p>
  </div>
);

const PersonalDetailsCard = ({ user }) => {
  const dispatch = useDispatch();
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    toFormValues(user),
    profileSchema,
  );

  const onSubmit = handleSubmit(async (data) => {
    const res = await updateMyProfile(toPayload(data));
    if (res.ok) dispatch(setUser(res.data));
    return res;
  });

  return (
    <Card title="Personal details" subtitle="Contact details are never shown publicly">
      <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <ReadOnlyField label="Email" value={user.email} />
        <ReadOnlyField
          label="Mobile number"
          value={user.phone ? `${PHONE_PREFIX} ${user.phone}` : "Not added"}
        />
        <FormInput
          name="fullName"
          label="Full name"
          required
          value={values.fullName}
          onChange={handleChange}
          error={errors.fullName}
          className="sm:col-span-2"
        />
        <FormInput
          name="dateOfBirth"
          label="Date of birth"
          type="date"
          value={values.dateOfBirth}
          onChange={handleChange}
          error={errors.dateOfBirth}
          helperText="Only your age is shown publicly"
        />
        <Select
          name="gender"
          label="Gender"
          clearable
          options={GENDER_OPTIONS}
          value={values.gender}
          onChange={handleChange}
          error={errors.gender}
        />
        <PlaceSearch
          name="city"
          label="City"
          type={PLACE_SEARCH_TYPE.CITY}
          placeholder="Search your town or city"
          value={values.city}
          onChange={handleChange}
          error={errors.city ?? errors.cityPlaceId}
        />
        <Textarea
          name="bio"
          label="Bio"
          maxLength={USER_RULES.BIO_MAX}
          value={values.bio}
          onChange={handleChange}
          error={errors.bio}
          placeholder="A line about how you play"
          className="sm:col-span-2"
        />
        <div className="flex justify-end sm:col-span-2">
          <Button type="submit" loading={isSubmitting}>
            Save details
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PersonalDetailsCard;
