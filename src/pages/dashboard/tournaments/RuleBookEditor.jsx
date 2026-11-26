import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormInput from "@/components/ui/FormInput";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import Textarea from "@/components/ui/Textarea";
import { RULE_LIMITS } from "@/constants/rule.constants";
import { listRules } from "@/services/rule.service";
import { listTournamentRules, replaceTournamentRules } from "@/services/tournament.service";

const toRow = (rule) => ({
  rowKey: rule.id,
  masterRuleId: rule.masterRuleId,
  title: rule.title,
  description: rule.description,
  isCustom: rule.isCustom,
});

const RuleBookEditor = ({ tournamentId }) => {
  const [rows, setRows] = useState(null);
  const [masterRules, setMasterRules] = useState([]);
  const [customRule, setCustomRule] = useState({ title: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([listTournamentRules(tournamentId), listRules()]).then(
      ([tournamentRes, masterRes]) => {
        setRows((tournamentRes.ok ? tournamentRes.data : []).map(toRow));
        setMasterRules(masterRes.ok ? masterRes.data : []);
      },
    );
  }, [tournamentId]);

  const availableMasterOptions = useMemo(() => {
    const selected = new Set(rows?.map((row) => row.masterRuleId));
    return masterRules
      .filter((rule) => !selected.has(rule.id))
      .map((rule) => ({ label: rule.title, value: rule.id }));
  }, [rows, masterRules]);

  const moveRow = (index, offset) =>
    setRows((previous) => {
      const next = [...previous];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });

  const addMasterRule = (_, masterRuleId) => {
    const rule = masterRules.find((item) => item.id === masterRuleId);
    if (rule)
      setRows((previous) => [
        ...previous,
        {
          rowKey: crypto.randomUUID(),
          masterRuleId,
          title: rule.title,
          description: rule.description,
          isCustom: false,
        },
      ]);
  };

  const addCustomRule = () => {
    if (customRule.title.trim().length < 3 || customRule.description.trim().length < 3) return;
    setRows((previous) => [
      ...previous,
      { rowKey: crypto.randomUUID(), masterRuleId: null, ...customRule, isCustom: true },
    ]);
    setCustomRule({ title: "", description: "" });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await replaceTournamentRules(
      tournamentId,
      rows.map((row) =>
        row.isCustom
          ? { title: row.title.trim(), description: row.description.trim() }
          : { masterRuleId: row.masterRuleId },
      ),
    );
    setIsSaving(false);
    if (res.ok) setRows(res.data.map(toRow));
  };

  if (!rows) return <Skeleton className="h-60 w-full rounded-xl" />;

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Tournament rule book"
        subtitle="Starts with the Maidaan master rules. Remove what doesn't apply and add your own."
        footer={
          <div className="flex justify-end">
            <Button onClick={handleSave} loading={isSaving}>
              Save rule book
            </Button>
          </div>
        }
      >
        <ol className="flex flex-col divide-y divide-line">
          {rows.map((row, index) => (
            <li key={row.rowKey} className="flex items-start gap-3 py-3">
              <span className="mt-0.5 w-5 text-sm font-bold text-fg-muted">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-fg">
                  {row.title}
                  {row.isCustom && (
                    <Badge size="sm" variant="accent">
                      Custom
                    </Badge>
                  )}
                </p>
                <p className="text-sm text-fg-muted">{row.description}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => moveRow(index, -1)}
                  startIcon={<ArrowUp className="size-4" />}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2"
                  aria-label="Move down"
                  disabled={index === rows.length - 1}
                  onClick={() => moveRow(index, 1)}
                  startIcon={<ArrowDown className="size-4" />}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2 text-danger"
                  aria-label={`Remove ${row.title}`}
                  onClick={() =>
                    setRows((previous) => previous.filter((item) => item.rowKey !== row.rowKey))
                  }
                  startIcon={<Trash2 className="size-4" />}
                />
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Add a master rule">
          <Select
            name="masterRule"
            placeholder={availableMasterOptions.length ? "Choose a rule" : "All master rules added"}
            searchable
            options={availableMasterOptions}
            value={null}
            onChange={addMasterRule}
            disabled={!availableMasterOptions.length}
          />
        </Card>
        <Card title="Add a custom rule" bodyClassName="flex flex-col gap-3">
          <FormInput
            name="title"
            label="Title"
            maxLength={RULE_LIMITS.TITLE_MAX}
            value={customRule.title}
            onChange={(_, title) => setCustomRule((previous) => ({ ...previous, title }))}
          />
          <Textarea
            name="description"
            label="Description"
            rows={2}
            maxLength={RULE_LIMITS.DESCRIPTION_MAX}
            value={customRule.description}
            onChange={(_, description) =>
              setCustomRule((previous) => ({ ...previous, description }))
            }
          />
          <Button
            variant="outline"
            onClick={addCustomRule}
            startIcon={<Plus className="size-4" />}
            className="self-start"
          >
            Add rule
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default RuleBookEditor;
