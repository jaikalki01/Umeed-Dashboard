import React, { useCallback, useEffect, useMemo, useState } from "react";
import { User, UserFilters } from "@/types/user";
import { UserFilters as UserFiltersComponent } from "@/components/admin/UserFilters";
import UserCard from "@/components/admin/UserCard";
import { BulkActions } from "@/components/admin/BulkActions";
import { AdminStats } from "@/components/admin/AdminStats";
import { useToast } from "@/hooks/use-toast";
import { getAllUser, BulkUpdatePayload, updateUsersBulk } from "@/api/apihelper";

type BulkAction = { type: string; field?: string; value?: string | boolean };

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Stats
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [pendingUsers, setPendingUsers] = useState<number>(0);
  const [bannedUsers, setBannedUsers] = useState<number>(0);
  const [paidUsers, setPaidUsers] = useState<number>(0);
  const [exclusiveUsers, setExclusiveUsers] = useState<number>(0);
  const [photo1Pending, setPhoto1Pending] = useState<number>(0);
  const [photo2Pending, setPhoto2Pending] = useState<number>(0);
  const [bioPending, setBioPending] = useState<number>(0);
  const [expectationsPending, setExpectationsPending] = useState<number>(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const { toast } = useToast();

  // Derived totalPages when totalUsers or pageSize change
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(totalUsers / pageSize)));
  }, [totalUsers, pageSize]);

  // Fetch users (wrapped in useCallback for stable reference)
  const fetchUsers = useCallback(
    async (pageToFetch = currentPage) => {
      setIsLoading(true);
      let mounted = true;
      try {
        const res = await getAllUser(pageToFetch, pageSize, filters);
        if (!mounted) return;

        if (res && res.success && res.data) {
          const d = res.data;
          setUsers(d.users || []);
          setTotalUsers(d.total || 0);
          setTotalPages(d.totalPages || Math.max(1, Math.ceil((d.total || 0) / pageSize)));

          // Stats - guard with fallback numbers
          setActiveUsers(d.ActiveUsers ?? 0);
          setPendingUsers(d.PendingUsers ?? 0);
          setBannedUsers(d.BannedUsers ?? 0);
          setPaidUsers(d.PaidUsers ?? 0);
          setExclusiveUsers(d.ExclusiveUsers ?? 0);
          setPhoto1Pending(d.Photo1Pending ?? 0);
          setPhoto2Pending(d.Photo2Pending ?? 0);
          setBioPending(d.BioPending ?? 0);
          setExpectationsPending(d.ExpectationsPending ?? 0);
        } else {
          toast({ title: "Error", description: res?.message || "Failed to fetch users", variant: "destructive" });
        }
      } catch (err: any) {
        console.error("fetchUsers error:", err);
        toast({ title: "Error", description: "Failed to fetch users. Please try again.", variant: "destructive" });
      } finally {
        if (mounted) setIsLoading(false);
      }

      return () => {
        mounted = false;
      };
    },
    [currentPage, pageSize, filters, toast]
  );

  // Reset page to 1 whenever filters or pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize]);

  // Re-fetch when page changes, pageSize or filters change
  useEffect(() => {
    fetchUsers(currentPage);
  }, [fetchUsers, currentPage]);

  // Local UI filter (client-side search/filtering)
  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) return [];

    const search = (filters.searchQuery || "").toString().trim().toLowerCase();

    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.id.toString().includes(search) ||
        (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
        (u.mobile && u.mobile.toString().includes(search));

      const matchesStatus = !filters.status || u.status === filters.status;
      const matchesMemtype = !filters.memtype || u.memtype === filters.memtype;
      const matchesGender = !filters.gender || u.gender === filters.gender;
      const matchesCountry = !filters.country || u.country === filters.country;

      const matchesPhoto1 =
        filters.photo1Approve === undefined || u.photo1Approve === filters.photo1Approve;
      const matchesPhoto2 =
        filters.photo2Approve === undefined || u.photo2Approve === filters.photo2Approve;
      const matchesBio =
        filters.bioApproved === undefined || u.bio_approval === filters.bioApproved;
      const matchesExpectations =
        filters.expectationsApproved === undefined ||
        u.partnerExpectations_approval === filters.expectationsApproved;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMemtype &&
        matchesGender &&
        matchesCountry &&
        matchesPhoto1 &&
        matchesPhoto2 &&
        matchesBio &&
        matchesExpectations
      );
    });

  }, [users, filters]);

  // Pagination helpers
  const handlePreviousPage = useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), []);
  const handleNextPage = useCallback(() => setCurrentPage((p) => Math.min(totalPages, p + 1)), [totalPages]);
  const handlePageChange = useCallback((page: number) => setCurrentPage((p) => (page >= 1 && page <= totalPages ? page : p)), [totalPages]);

  // Selection helpers
  const toggleSelectUser = useCallback((userId: string, checked: boolean) => {
    setSelectedUsers((prev) => (checked ? [...prev, userId] : prev.filter((id) => id !== userId)));
  }, []);

  const selectAllFiltered = useCallback(() => {
    setSelectedUsers((prev) => (prev.length === filteredUsers.length ? [] : filteredUsers.map((u) => u.id)));
  }, [filteredUsers]);

  const clearSelection = useCallback(() => setSelectedUsers([]), []);

  // Bulk update
  const bulkUpdateSelected = useCallback(async (payload: Omit<BulkUpdatePayload, "user_ids">) => {
    if (!selectedUsers || selectedUsers.length === 0) {
      toast({ title: "No selection", description: "Please select users to update", variant: "destructive" });
      return;
    }

    const fullPayload: BulkUpdatePayload = { user_ids: selectedUsers, ...payload } as BulkUpdatePayload;

    setIsLoading(true);
    try {
      const res = await updateUsersBulk(fullPayload);
      if (res && res.success) {
        toast({ title: "Updated", description: res.message || "Users updated successfully" });
        await fetchUsers(currentPage);
        setSelectedUsers([]);
      } else {
        toast({ title: "Error", description: res?.message || "Bulk update failed", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("bulk update error:", err);
      const message = err?.message || err?.detail || "Bulk update failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [selectedUsers, toast, fetchUsers, currentPage]);

  const handleBulkAction = useCallback((action: BulkAction) => {
    if (!action || !action.type) return;

    switch (action.type) {
      case "approve":
        if (action.field === "photo1") bulkUpdateSelected({ photo1Approve: true });
        else if (action.field === "photo2") bulkUpdateSelected({ photo2Approve: true });
        else if (action.field === "bio") bulkUpdateSelected({ bioApproved: true });
        else if (action.field === "expectations") bulkUpdateSelected({ expectationsApproved: true });
        break;
      case "disapprove":
        if (action.field === "photo1") bulkUpdateSelected({ photo1Approve: false });
        else if (action.field === "photo2") bulkUpdateSelected({ photo2Approve: false });
        else if (action.field === "bio") bulkUpdateSelected({ bioApproved: false });
        else if (action.field === "expectations") bulkUpdateSelected({ expectationsApproved: false });
        break;
      case "status":
        if (typeof action.value === "string") bulkUpdateSelected({ status: action.value });
        break;
      default:
        console.warn("Unhandled bulk action:", action);
        toast({ title: "Unsupported action", description: "This bulk action is not supported.", variant: "destructive" });
    }
  }, [bulkUpdateSelected, toast]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage users, approvals, and permissions</p>
        </div>
      </header>

      <AdminStats
        users={filteredUsers}
        total={totalUsers}
        active={activeUsers}
        pending={pendingUsers}
        banned={bannedUsers}
        paid={paidUsers}
        exclusive={exclusiveUsers}
        photo1Pending={photo1Pending}
        photo2Pending={photo2Pending}
        bioPending={bioPending}
        expectationsPending={expectationsPending}
      />

      <UserFiltersComponent filters={filters} onFiltersChange={setFilters} totalUsers={totalUsers} filteredUsers={users?.length || 0} />

      <BulkActions
        selectedCount={selectedUsers.length}
        selectedUsers={selectedUsers}
        onSelectAll={selectAllFiltered}
        onClearSelection={clearSelection}
        onBulkAction={handleBulkAction}
        onRefresh={() => fetchUsers(currentPage)}
      />

      {/* Pagination & Controls */}
      <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-700">
              Showing <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, totalUsers)}</span> - <span className="font-medium">{Math.min(currentPage * pageSize, totalUsers)}</span> of <span className="font-medium">{totalUsers}</span> users
            </p>

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-1">
            <button onClick={handlePreviousPage} disabled={currentPage === 1 || isLoading} className="px-2 sm:px-3 py-2 text-xs sm:text-sm border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>

            {/* Page buttons (compact smart window) */}
            {(() => {
              const pages = [] as React.ReactNode[];
              let startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(totalPages, startPage + 4);
              if (endPage - startPage + 1 < 5) startPage = Math.max(1, endPage - 4);

              if (startPage > 1) {
                pages.push(<button key={1} onClick={() => handlePageChange(1)} className="px-2 sm:px-3 py-2 text-xs sm:text-sm border rounded-md hover:bg-gray-50">1</button>);
                if (startPage > 2) pages.push(<span key="ellipsis1" className="px-1 sm:px-2 text-xs sm:text-sm">...</span>);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button key={i} onClick={() => handlePageChange(i)} disabled={isLoading} className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${i === currentPage ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"}`}>
                    {i}
                  </button>
                );
              }

              if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push(<span key="ellipsis2" className="px-1 sm:px-2 text-xs sm:text-sm">...</span>);
                pages.push(<button key={totalPages} onClick={() => handlePageChange(totalPages)} className="px-2 sm:px-3 py-2 text-xs sm:text-sm border rounded-md hover:bg-gray-50">{totalPages}</button>);
              }

              return pages;
            })()}

            <button onClick={handleNextPage} disabled={currentPage === totalPages || isLoading} className="px-2 sm:px-3 py-2 text-xs sm:text-sm border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      {/* Users grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filteredUsers.map((u) => (
          <UserCard
            key={u.id}
            user={u}
            isSelected={selectedUsers.includes(u.id)}
            onSelectionChange={(userId, checked) => toggleSelectUser(userId, checked)}
          />
        ))}
      </section>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground text-base sm:text-lg">No users found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
