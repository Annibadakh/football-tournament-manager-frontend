import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";
import TournamentStatusBadge from "@/components/tournament/TournamentStatusBadge";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import useServerTable from "@/hooks/useServerTable";
import { buildPath, ROUTES } from "@/constants/routes.constants";
import { ALL_STATUS_OPTIONS } from "@/constants/tournament.constants";
import { ACCOUNT_ROLE } from "@/constants/user.constants";
import { listManagedTournaments } from "@/services/tournament.service";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { formatDateRange } from "@/utils/tournament";
import CreateTournamentModal from "@/pages/dashboard/tournaments/CreateTournamentModal";

const ADMIN_ROLES = [ACCOUNT_ROLE.SUPERADMIN, ACCOUNT_ROLE.ADMIN];

const COLUMNS = [
  {
    accessorKey: "name",
    header: "Tournament",
    cell: ({ row }) => (
      <Link
        to={buildPath(ROUTES.MANAGE_TOURNAMENT, { tournamentId: row.original.slug })}
        className="font-semibold text-link hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ getValue }) => <TournamentStatusBadge status={getValue()} size="sm" />,
  },
  {
    accessorKey: "startDate",
    header: "Dates",
    cell: ({ row }) => formatDateRange(row.original.startDate, row.original.endDate),
  },
  {
    id: "city",
    header: "City",
    enableSorting: false,
    cell: ({ row }) => row.original.city?.name ?? "—",
  },
  {
    id: "organizer",
    header: "Organizer",
    enableSorting: false,
    cell: ({ row }) => row.original.organizer?.fullName ?? "—",
  },
];

const ManageTournamentsPage = () => {
  const user = useSelector(selectCurrentUser);
  const isAdmin = ADMIN_ROLES.includes(user.accountRole);
  const { tableState, onPaginationChange, onSortingChange, setSearch, queryParams } =
    useServerTable({
      sorting: [{ id: "createdAt", desc: true }],
    });
  const [status, setStatus] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [result, setResult] = useState({ items: [], total: 0, queryKey: null });

  const params = useMemo(
    () => ({ ...queryParams, ...(status && { status }) }),
    [queryParams, status],
  );
  const queryKey = JSON.stringify(params);
  const isLoading = result.queryKey !== queryKey;

  useEffect(() => {
    const controller = new AbortController();
    listManagedTournaments(JSON.parse(queryKey), { signal: controller.signal }).then((res) => {
      if (!res.cancelled)
        setResult({ items: res.ok ? res.data : [], total: res.meta?.total ?? 0, queryKey });
    });
    return () => controller.abort();
  }, [queryKey]);

  return (
    <>
      <PageHeader
        title="Tournaments"
        subtitle={isAdmin ? "All tournaments on Maidaan" : "Tournaments you organize"}
        actions={
          isAdmin && (
            <Button onClick={() => setIsCreateOpen(true)} startIcon={<Plus className="size-4" />}>
              Create tournament
            </Button>
          )
        }
      />
      <DataTable
        columns={COLUMNS}
        data={result.items}
        total={result.total}
        state={tableState}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        loading={isLoading}
        getRowId={(row) => row.id}
        emptyState={
          <EmptyState
            title="No tournaments yet"
            description={
              isAdmin
                ? "Create one under an organizer to get started."
                : "An admin will create tournaments for you."
            }
          />
        }
        toolbar={
          <>
            <SearchInput
              placeholder="Search tournaments"
              onSearch={setSearch}
              className="w-full sm:w-80"
            />
            <Select
              name="status"
              placeholder="All statuses"
              clearable
              options={ALL_STATUS_OPTIONS}
              value={status}
              onChange={(_, value) => {
                setStatus(value);
                onPaginationChange((previous) => ({ ...previous, pageIndex: 0 }));
              }}
              className="w-full sm:w-48"
            />
          </>
        }
      />
      {isAdmin && (
        <CreateTournamentModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      )}
    </>
  );
};

export default ManageTournamentsPage;
