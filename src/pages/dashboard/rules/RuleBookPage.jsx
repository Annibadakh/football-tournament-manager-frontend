import { useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormInput from "@/components/ui/FormInput";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import Switch from "@/components/ui/Switch";
import Textarea from "@/components/ui/Textarea";
import useForm from "@/hooks/useForm";
import {
  RULE_CATEGORY_LABEL,
  RULE_CATEGORY_OPTIONS,
  RULE_LIMITS,
} from "@/constants/rule.constants";
import { createRule, listRules, updateRule } from "@/services/rule.service";
import { ruleSchema } from "@/validations/tournament.schema";

const FORM_ID = "rule-form";
const EMPTY_RULE = { title: "", description: "", category: null, isActive: true };

const RuleFormModal = ({ rule, onClose, onSaved }) => {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    rule
      ? {
          title: rule.title,
          description: rule.description,
          category: rule.category,
          isActive: rule.isActive,
        }
      : EMPTY_RULE,
    ruleSchema,
  );

  const onSubmit = handleSubmit(async (data) => {
    const res = rule ? await updateRule(rule.id, data) : await createRule(data);
    if (res.ok) onSaved();
    return res;
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={rule ? "Edit rule" : "Add rule"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={isSubmitting}>
            Save rule
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormInput
          name="title"
          label="Title"
          required
          maxLength={RULE_LIMITS.TITLE_MAX}
          value={values.title}
          onChange={handleChange}
          error={errors.title}
        />
        <Textarea
          name="description"
          label="Description"
          required
          rows={4}
          maxLength={RULE_LIMITS.DESCRIPTION_MAX}
          value={values.description}
          onChange={handleChange}
          error={errors.description}
        />
        <Select
          name="category"
          label="Category"
          required
          options={RULE_CATEGORY_OPTIONS}
          value={values.category}
          onChange={handleChange}
          error={errors.category}
        />
        <Switch
          name="isActive"
          label="Active"
          description="Inactive rules aren't added to new tournaments"
          checked={values.isActive}
          onChange={handleChange}
        />
      </form>
    </Modal>
  );
};

// Admin page for the master rule book that new tournaments start with
const RuleBookPage = () => {
  const [rules, setRules] = useState(null);
  const [editing, setEditing] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    listRules({ includeInactive: true }).then((res) => setRules(res.ok ? res.data : []));
  }, [reloadCount]);

  const handleSaved = () => {
    setEditing(null);
    setReloadCount((count) => count + 1);
  };

  return (
    <>
      <PageHeader
        title="Master rule book"
        subtitle="New tournaments start with the active rules. Organizers can remove them or add their own."
        actions={
          <Button onClick={() => setEditing("new")} startIcon={<Plus className="size-4" />}>
            Add rule
          </Button>
        }
      />
      {!rules ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <div className="grid gap-4">
          {RULE_CATEGORY_OPTIONS.map(({ value, label }) => {
            const categoryRules = rules.filter((rule) => rule.category === value);
            if (!categoryRules.length) return null;
            return (
              <Card
                key={value}
                title={label}
                bodyClassName="flex flex-col divide-y divide-line p-0"
              >
                {categoryRules.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-fg">
                        {rule.title}
                        {!rule.isActive && <Badge size="sm">Inactive</Badge>}
                      </p>
                      <p className="text-sm text-fg-muted">{rule.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="px-2"
                      aria-label={`Edit ${rule.title} (${RULE_CATEGORY_LABEL[rule.category]})`}
                      onClick={() => setEditing(rule)}
                      startIcon={<Pencil className="size-4" />}
                    />
                  </div>
                ))}
              </Card>
            );
          })}
        </div>
      )}
      {editing && (
        <RuleFormModal
          rule={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
};

export default RuleBookPage;
