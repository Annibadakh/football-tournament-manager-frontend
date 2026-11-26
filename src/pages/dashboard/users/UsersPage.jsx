import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Ban, MailPlus, RotateCcw, UserPlus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DataTable from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import useServerTable from "@/hooks/useServerTable";
import {
  ACCOUNT_ROLE,
  ACCOUNT_ROLE_LABEL,
  ACCOUNT_STATUS,
  ACCOUNT_STATUS_BADGE,
  ACCOUNT_STATUS_LABEL,
  PHONE_PREFIX,
} from "@/constants/user.constants";
import { listUsers, resendUserInvite, setUserBlocked } from "@/services/user.service";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { formatDateTime } from "@/utils/date";
import CreateUserModal from "@/pages/dashboard/users/CreateUserModal";

const ROLE_FILTER_OPTIONS = Object.values(ACCOUNT_ROLE).map((role) => ({
  label: ACCOUNT_ROLE_LABEL[role],
  value: role,
}));
const STATUS_FILTER_OPTIONS = Object.values(ACCOUNT_STATUS).map((status) => ({
  label: ACCOUNT_STATUS_LABEL[status],
  value: status,
}));

// Mirrors the API rule: you can only manage accounts with a lower role than yours
const canManage = (actor, user) => actor.id !== user.id && actor.accountRole < user.accountRole;

const UsersPage = () => {
  const actor = useSelector(selectCurrentUser);
  const { tableState, onPaginationChange, onSortingChange, setSearch, queryParams } =
    useServerTable({
      sorting: [{ id: "createdAt", desc: true }],
    });
  const [filters, setFilters] = useState({ accountRole: null, accountStatus: null });
  const [result, setResult] = useState({ items: [], total: 0, queryKey: null });
  const [reloadCount, setReloadCount] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingBlock, setPendingBlock] = useState(null);
  const [busyUserId, setBusyUserId] = useState(null);

  const params = useMemo(
    () => ({
      ...queryParams,
      ...(filters.accountRole && { accountRole: filters.accountRole }),
      ...(filters.accountStatus && { accountStatus: filters.accountStatus }),
    }),
    [queryParams, filters],
  );
  const queryKey = JSON.stringify({ params, reloadCount });
  const isLoading = result.queryKey !== queryKey;

  // Aborts stale requests when filters change quickly
  useEffect(() => {
    const controller = new AbortController();
    listUsers(JSON.parse(queryKey).params, { signal: controller.signal }).then((res) => {
      if (res.cancelled) return;
      setResult({ items: res.ok ? res.data : [], total: res.meta?.total ?? 0, queryKey });
    });
    return () => controller.abort();
  }, [queryKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  const handleFilterChange = (name, value) => {
    setFilters((previous) => ({ ...previous, [name]: value }));
    onPaginationChange((previous) => ({ ...previous, pageIndex: 0 }));
  };

  const handleResendInvite = async (user) => {
    setBusyUserId(user.id);
    await resendUserInvite(user.id);
    setBusyUserId(null);
  };

  const handleToggleBlock = async () => {
    const user = pendingBlock;
    setBusyUserId(user.id);
    const res = await setUserBlocked(user.id, user.accountStatus !== ACCOUNT_STATUS.BLOCKED);
    setBusyUserId(null);
    setPendingBlock(null);
    if (res.ok) reload();
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.fullName}</p>
            <p className="text-xs text-fg-muted">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Mobile",
        enableSorting: false,
        cell: ({ getValue }) => (getValue() ? `${PHONE_PREFIX} ${getValue()}` : "—"),
      },
      {
        accessorKey: "accountRole",
        header: "Role",
        enableSorting: false,
        cell: ({ getValue }) => <Badge variant="info">{ACCOUNT_ROLE_LABEL[getValue()]}</Badge>,
      },
      {
        accessorKey: "accountStatus",
        header: "Status",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Badge variant={ACCOUNT_STATUS_BADGE[getValue()]}>
            {ACCOUNT_STATUS_LABEL[getValue()]}
          </Badge>
        ),
      },
      {
        accessorKey: "lastLoginAt",
        header: "Last login",
        cell: ({ getValue }) => formatDateTime(getValue()) || "Never",
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const user = row.original;
          if (!canManage(actor, user)) return null;
          const isBlocked = user.accountStatus === ACCOUNT_STATUS.BLOCKED;
          return (
            <div className="flex justify-end gap-1">
              {user.accountStatus === ACCOUNT_STATUS.GUEST && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2"
                  loading={busyUserId === user.id}
                  onClick={() => handleResendInvite(user)}
                  aria-label={`Resend invite to ${user.fullName}`}
                  title="Resend invite"
                  startIcon={<MailPlus className="size-4" />}
                />
              )}
              <Button
                size="sm"
                variant="ghost"
                className={
                  isBlocked ? "px-2 text-brand-700 dark:text-brand-300" : "px-2 text-danger"
                }
                onClick={() => setPendingBlock(user)}
                aria-label={`${isBlocked ? "Unblock" : "Block"} ${user.fullName}`}
                title={isBlocked ? "Unblock" : "Block"}
                startIcon={
                  isBlocked ? <RotateCcw className="size-4" /> : <Ban className="size-4" />
                }
              />
            </div>
          );
        },
      },
    ],
    [actor, busyUserId],
  );

  const isBlockingAction = pendingBlock?.accountStatus !== ACCOUNT_STATUS.BLOCKED;

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Everyone on Maidaan. Invite admins and organizers, block accounts."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} startIcon={<UserPlus className="size-4" />}>
            Invite account
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={result.items}
        total={result.total}
        state={tableState}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        loading={isLoading}
        getRowId={(row) => row.id}
        toolbar={
          <>
            <SearchInput
              placeholder="Search name, email or mobile"
              onSearch={setSearch}
              className="w-full sm:w-80"
            />
            <Select
              name="accountRole"
              placeholder="All roles"
              clearable
              options={ROLE_FILTER_OPTIONS}
              value={filters.accountRole}
              onChange={handleFilterChange}
              className="w-full sm:w-44"
            />
            <Select
              name="accountStatus"
              placeholder="All statuses"
              clearable
              options={STATUS_FILTER_OPTIONS}
              value={filters.accountStatus}
              onChange={handleFilterChange}
              className="w-full sm:w-44"
            />
          </>
        }
      />
      <CreateUserModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={reload}
        actorRole={actor.accountRole}
      />
      <ConfirmDialog
        open={Boolean(pendingBlock)}
        onClose={() => setPendingBlock(null)}
        onConfirm={handleToggleBlock}
        loading={Boolean(pendingBlock) && busyUserId === pendingBlock?.id}
        variant={isBlockingAction ? "danger" : "primary"}
        title={
          isBlockingAction
            ? `Block ${pendingBlock?.fullName}?`
            : `Unblock ${pendingBlock?.fullName}?`
        }
        message={
          isBlockingAction
            ? "They'll be signed out immediately and won't be able to log in until unblocked."
            : "They'll be able to log in again."
        }
        confirmText={isBlockingAction ? "Block account" : "Unblock"}
      />
    </>
  );
};

export default UsersPage;
