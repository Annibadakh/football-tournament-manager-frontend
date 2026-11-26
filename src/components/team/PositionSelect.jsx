import Select from "@/components/ui/Select";
import usePositions from "@/hooks/usePositions";
import { PERSON_MODE } from "@/constants/team.constants";

// Verified players can only play their profile positions; guests can take any position
const PositionSelect = ({
  name = "positionId",
  person,
  value,
  onChange,
  error,
  label = "Position",
}) => {
  const allPositions = usePositions();
  const isVerified = person?.mode === PERSON_MODE.VERIFIED;
  const positions = isVerified ? (person.player?.positions ?? []) : allPositions;
  const placeholder = isVerified && !person.player ? "Choose a player first" : "Select...";

  return (
    <Select
      name={name}
      label={label}
      required
      placeholder={placeholder}
      disabled={isVerified && !person.player}
      options={positions.map((position) => ({ label: position.name, value: position.id }))}
      value={value}
      onChange={onChange}
      error={error}
      emptyMessage="This player hasn't added any positions"
    />
  );
};

export default PositionSelect;
