import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { USER_RULES } from "@/constants/user.constants";
import { replaceMyPositions } from "@/services/me.service";
import { listPositions } from "@/services/position.service";
import { setUser } from "@/store/slices/authSlice";
import { cn } from "@/utils/cn";

const toSelection = (user) =>
  user.positions.map(({ id, isPrimary }) => ({ positionId: id, isPrimary }));

// Keeps exactly one primary whenever at least one position is selected
const ensurePrimary = (selection) =>
  selection.length && !selection.some((item) => item.isPrimary)
    ? selection.map((item, index) => ({ ...item, isPrimary: index === 0 }))
    : selection;

const PositionsCard = ({ user }) => {
  const dispatch = useDispatch();
  const [positions, setPositions] = useState(null);
  const [selection, setSelection] = useState(() => toSelection(user));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    listPositions().then((res) => setPositions(res.ok ? res.data : []));
  }, []);

  const findSelected = (positionId) => selection.find((item) => item.positionId === positionId);

  const togglePosition = (positionId) => {
    setSelection((previous) => {
      const isSelected = previous.some((item) => item.positionId === positionId);
      if (isSelected)
        return ensurePrimary(previous.filter((item) => item.positionId !== positionId));
      if (previous.length >= USER_RULES.MAX_POSITIONS) return previous;
      return ensurePrimary([...previous, { positionId, isPrimary: false }]);
    });
  };

  const makePrimary = (positionId) =>
    setSelection((previous) =>
      previous.map((item) => ({ ...item, isPrimary: item.positionId === positionId })),
    );

  const handleSave = async () => {
    setIsSaving(true);
    const res = await replaceMyPositions(selection);
    setIsSaving(false);
    if (res.ok) dispatch(setUser(res.data));
  };

  return (
    <Card
      title="Playing positions"
      subtitle="Pick every position you play and star your main one. Captains choose from these when adding you."
    >
      {!positions ? (
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Positions">
            {positions.map((position) => {
              const selected = findSelected(position.id);
              return (
                <div
                  key={position.id}
                  className={cn(
                    "inline-flex items-center overflow-hidden rounded-full border transition-colors",
                    selected
                      ? "border-brand-600 bg-brand-50 dark:bg-brand-900"
                      : "border-line bg-surface",
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={Boolean(selected)}
                    onClick={() => togglePosition(position.id)}
                    className={cn(
                      "px-4 py-2 text-sm font-semibold",
                      selected ? "text-brand-700 dark:text-brand-200" : "text-fg",
                    )}
                  >
                    {position.name}
                  </button>
                  {selected && (
                    <button
                      type="button"
                      onClick={() => makePrimary(position.id)}
                      aria-label={`Make ${position.name} your primary position`}
                      aria-pressed={selected.isPrimary}
                      title={selected.isPrimary ? "Primary position" : "Make primary"}
                      className="border-l border-brand-200 px-3 py-2 dark:border-brand-700"
                    >
                      <Star
                        className={cn(
                          "size-4",
                          selected.isPrimary ? "fill-accent-500 text-accent-500" : "text-fg-muted",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} loading={isSaving}>
              Save positions
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PositionsCard;
