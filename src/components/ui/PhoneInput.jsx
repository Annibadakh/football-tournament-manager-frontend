import FormInput from "@/components/ui/FormInput";
import { PHONE_PREFIX, USER_RULES } from "@/constants/user.constants";

// India-only mobile input: shows +91, keeps only the 10 digits that are stored
const PhoneInput = ({ name = "phone", label = "Mobile number", value, onChange, ...rest }) => (
  <FormInput
    name={name}
    label={label}
    type="tel"
    inputMode="numeric"
    autoComplete="tel-national"
    maxLength={USER_RULES.PHONE_LENGTH}
    placeholder="9876543210"
    value={value}
    onChange={(fieldName, nextValue) => onChange(fieldName, nextValue.replace(/\D/g, ""))}
    startIcon={<span className="text-sm font-semibold">{PHONE_PREFIX}</span>}
    {...rest}
  />
);

export default PhoneInput;
