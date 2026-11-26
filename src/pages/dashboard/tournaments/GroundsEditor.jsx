import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import FormInput from "@/components/ui/FormInput";
import PlaceSearch from "@/components/ui/PlaceSearch";
import Skeleton from "@/components/ui/Skeleton";
import { TOURNAMENT_RULES } from "@/constants/tournament.constants";
import { listGrounds, replaceGrounds } from "@/services/tournament.service";

// rowKey keeps React keys stable for new rows that don't have an id yet
const toRows = (grounds) => grounds.map((ground) => ({ ...ground, rowKey: ground.id }));

const GroundsEditor = ({ tournamentId }) => {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    listGrounds(tournamentId).then((res) => setRows(toRows(res.ok ? res.data : [])));
  }, [tournamentId]);

  const updateRow = (rowKey, changes) =>
    setRows((previous) =>
      previous.map((row) => (row.rowKey === rowKey ? { ...row, ...changes } : row)),
    );

  const addRow = () =>
    setRows((previous) => [
      ...previous,
      { rowKey: crypto.randomUUID(), name: `Ground ${previous.length + 1}`, place: null },
    ]);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await replaceGrounds(
      tournamentId,
      rows.map((row) => ({
        ...(row.id && { id: row.id }),
        name: row.name.trim(),
        placeId: row.place?.id ?? null,
      })),
    );
    setIsSaving(false);
    setError(res.ok ? null : (res.errors?.[0]?.message ?? res.message));
    if (res.ok) setRows(toRows(res.data));
  };

  if (!rows) return <Skeleton className="h-40 w-full rounded-xl" />;

  return (
    <Card
      title="Grounds"
      subtitle="Where matches are played. Fixtures are assigned to these grounds later."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={addRow}
            disabled={rows.length >= TOURNAMENT_RULES.MAX_GROUNDS}
            startIcon={<Plus className="size-4" />}
          >
            Add ground
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            Save grounds
          </Button>
        </div>
      }
    >
      {error && <p className="mb-3 text-sm text-danger">{error}</p>}
      {rows.length === 0 ? (
        <EmptyState
          title="No grounds yet"
          description="Add the grounds or turfs used in this tournament."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.rowKey} className="grid items-start gap-2 sm:grid-cols-[1fr_2fr_auto]">
              <FormInput
                name="name"
                label="Ground name"
                required
                value={row.name}
                onChange={(_, name) => updateRow(row.rowKey, { name })}
              />
              <PlaceSearch
                name="place"
                label="Location (optional)"
                placeholder="Search if it's at a different place"
                value={row.place}
                onChange={(_, place) => updateRow(row.rowKey, { place })}
              />
              <Button
                variant="ghost"
                className="mt-2 px-2 text-danger"
                aria-label={`Remove ${row.name}`}
                onClick={() =>
                  setRows((previous) => previous.filter((item) => item.rowKey !== row.rowKey))
                }
                startIcon={<Trash2 className="size-4" />}
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default GroundsEditor;
