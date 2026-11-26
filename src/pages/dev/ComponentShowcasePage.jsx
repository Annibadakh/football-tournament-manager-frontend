import { useEffect, useState } from "react";
import { HeartPulse, Plus, Trash2, Trophy, User } from "lucide-react";
import { z } from "zod";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import FormInput from "@/components/ui/FormInput";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import PageLoader from "@/components/ui/PageLoader";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import useServerTable from "@/hooks/useServerTable";
import { getHealthStatus } from "@/services/health.service";
import { formatCurrency, formatNumber } from "@/utils/number";
import { formatDateTime } from "@/utils/date";
import { validateWithSchema } from "@/utils/form";
import { fetchShowcaseTeams, POSITION_OPTIONS } from "@/pages/dev/showcaseData";

const demoSchema = z.object({
  playerName: z.string().trim().min(2, "Player name is required"),
  email: z.email("Enter a valid email"),
  positionId: z.number({ error: "Select a position" }),
});

const TEAM_COLUMNS = [
  { accessorKey: "teamName", header: "Team" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "points", header: "Points" },
  {
    accessorKey: "isVerified",
    header: "Status",
    enableSorting: false,
    cell: ({ getValue }) =>
      getValue() ? <Badge variant="brand">Verified</Badge> : <Badge variant="neutral">Guest</Badge>,
  },
];

const Section = ({ title, children }) => (
  <Card title={title} bodyClassName="flex flex-wrap items-start gap-3">
    {children}
  </Card>
);

const FormDemo = () => {
  const [values, setValues] = useState({ playerName: "", email: "", positionId: null });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = validateWithSchema(demoSchema, values);
    setErrors(result.errors);
    if (!result.isValid) return;
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1200);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid w-full gap-3 sm:grid-cols-2">
      <FormInput
        name="playerName"
        label="Player name"
        required
        value={values.playerName}
        onChange={handleChange}
        error={errors.playerName}
        startIcon={<User className="size-4" />}
      />
      <FormInput
        name="email"
        label="Email"
        type="email"
        required
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        helperText="An invite will be sent here"
      />
      <Select
        name="positionId"
        label="Position"
        required
        searchable
        clearable
        options={POSITION_OPTIONS}
        value={values.positionId}
        onChange={handleChange}
        error={errors.positionId}
      />
      <FormInput
        name="password"
        label="Password"
        type="password"
        value="secret123"
        onChange={() => {}}
      />
      <FormInput
        name="disabled"
        label="Disabled"
        value="Locked squad"
        disabled
        onChange={() => {}}
      />
      <div className="flex items-end">
        <Button type="submit" loading={isSubmitting} fullWidth>
          Validate with zod
        </Button>
      </div>
    </form>
  );
};

const TableDemo = () => {
  const { tableState, onPaginationChange, onSortingChange, setSearch, queryParams } =
    useServerTable();
  const [result, setResult] = useState({ data: [], total: 0, queryKey: null });
  const queryKey = JSON.stringify(queryParams);
  // Loading until the stored result belongs to the current query
  const isLoading = result.queryKey !== queryKey;

  useEffect(() => {
    let isCurrent = true;
    fetchShowcaseTeams(JSON.parse(queryKey)).then((response) => {
      if (isCurrent) setResult({ ...response, queryKey });
    });
    return () => {
      isCurrent = false;
    };
  }, [queryKey]);

  return (
    <div className="w-full">
      <DataTable
        columns={TEAM_COLUMNS}
        data={result.data}
        total={result.total}
        state={tableState}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        loading={isLoading}
        getRowId={(row) => String(row.id)}
        toolbar={
          <SearchInput placeholder="Search teams" onSearch={setSearch} className="w-full sm:w-72" />
        }
      />
      <p className="mt-2 text-xs text-fg-muted">Query sent to API: {JSON.stringify(queryParams)}</p>
    </div>
  );
};

const ApiDemo = () => {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkHealth = async () => {
    setIsLoading(true);
    const res = await getHealthStatus({ successToast: true });
    setHealth(res);
    setIsLoading(false);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        variant="outline"
        onClick={checkHealth}
        loading={isLoading}
        startIcon={<HeartPulse className="size-4" />}
      >
        Call GET /health via request()
      </Button>
      {health && (
        <pre className="overflow-x-auto rounded-lg bg-surface-muted p-3 text-xs">
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
    </div>
  );
};

// Dev-only page listing every generic component and its states
const ComponentShowcasePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }, 1200);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <PageHeader
        title="Component showcase"
        subtitle="Dev only. Every P1 generic component and its states."
        actions={<Button startIcon={<Plus className="size-4" />}>Page action</Button>}
      />

      <Section title="Buttons">
        <Button>Primary</Button>
        <Button variant="accent">Watch live</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="danger" startIcon={<Trash2 className="size-4" />}>
          Delete
        </Button>
        <Button loading>Saving</Button>
        <Button disabled>Disabled</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
      </Section>

      <Section title="Badges">
        <Badge variant="live">LIVE</Badge>
        <Badge variant="brand">Verified</Badge>
        <Badge variant="neutral">Guest</Badge>
        <Badge variant="accent">Captain</Badge>
        <Badge variant="success">Confirmed</Badge>
        <Badge variant="warning">Yellow card</Badge>
        <Badge variant="danger">Red card</Badge>
        <Badge variant="info">Scheduled</Badge>
        <Badge variant="brand" size="sm" icon={<Trophy className="size-3" />}>
          Winner
        </Badge>
      </Section>

      <Card title="Form controls (FormInput, Select, zod validation)">
        <FormDemo />
      </Card>

      <Card title="DataTable (server-side paging, sorting and search)">
        <TableDemo />
      </Card>

      <Section title="Loaders">
        <span className="text-brand-600">
          <Spinner size="sm" />
        </span>
        <span className="text-brand-600">
          <Spinner />
        </span>
        <span className="text-brand-600">
          <Spinner size="lg" />
        </span>
        <div className="flex w-full flex-col gap-2 sm:w-64">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="w-full">
          <PageLoader label="Loading tournament..." />
        </div>
      </Section>

      <Section title="Modal and ConfirmDialog">
        <Button variant="outline" onClick={() => setIsModalOpen(true)}>
          Open modal
        </Button>
        <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
          Remove player
        </Button>
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Invite player"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Send invite</Button>
            </>
          }
        >
          <FormInput name="inviteEmail" label="Email" value="" onChange={() => {}} />
        </Modal>
        <ConfirmDialog
          open={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirm}
          loading={isDeleting}
          title="Remove player?"
          message="The player will be removed from this squad. You can invite them again later."
          confirmText="Remove"
        />
      </Section>

      <Card title="EmptyState">
        <EmptyState
          title="No matches scheduled"
          description="Fixtures appear here once the organizer schedules them."
          action={<Button size="sm">Create fixture</Button>}
        />
      </Card>

      <Section title="Formatting utils">
        <p className="text-sm">
          {formatNumber(1250000)} · {formatCurrency(1500)} ·{" "}
          {formatDateTime("2026-11-26T10:30:00.000Z")}
        </p>
      </Section>

      <Card title="API layer">
        <ApiDemo />
      </Card>
    </div>
  );
};

export default ComponentShowcasePage;
