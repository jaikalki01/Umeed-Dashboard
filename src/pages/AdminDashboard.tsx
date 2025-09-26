import { useState, useMemo } from "react";
import { mockUsers } from "@/data/mockUsers";
import { User, UserFilters } from "@/types/user";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserFilters as UserFiltersComponent } from "@/components/admin/UserFilters";
import { BulkActions } from "@/components/admin/BulkActions";
import { UserCard } from "@/components/admin/UserCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

export const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});
  const { toast } = useToast();

  // Filter users based on current filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchFields = [user.name, user.email, user.mobile, user.id, user.city_name].join(' ').toLowerCase();
        if (!searchFields.includes(query)) return false;
      }

      // Status filter
      if (filters.status && user.status !== filters.status) return false;

      // Membership type filter
      if (filters.memtype && user.memtype !== filters.memtype) return false;

      // Gender filter
      if (filters.gender && user.gender !== filters.gender) return false;

      // Country filter
      if (filters.country && user.country !== filters.country) return false;

      // Photo approval filters
      if (filters.photo1Approve !== undefined && user.photo1Approve !== filters.photo1Approve) return false;
      if (filters.photo2Approve !== undefined && user.photo2Approve !== filters.photo2Approve) return false;

      // Content approval filters
      if (filters.bioApproved !== undefined && user.bioApproved !== filters.bioApproved) return false;
      if (filters.expectationsApproved !== undefined && user.expectationsApproved !== filters.expectationsApproved) return false;

      return true;
    });
  }, [users, filters]);

  const handleUserSelection = (userId: string, selected: boolean) => {
    setSelectedUsers(prev => 
      selected 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredUsers.map(u => u.id);
    setSelectedUsers(allFilteredIds);
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
  };

  const handleStatusChange = (userId: string, status: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: status as any } : user
    ));
    toast({
      title: "Status Updated",
      description: `User status changed to ${status}`,
    });
  };

  const handleApproval = (userId: string, type: 'photo1' | 'photo2' | 'bio' | 'expectations', approved: boolean) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        switch (type) {
          case 'photo1': return { ...user, photo1Approve: approved };
          case 'photo2': return { ...user, photo2Approve: approved };
          case 'bio': return { ...user, bioApproved: approved };
          case 'expectations': return { ...user, expectationsApproved: approved };
          default: return user;
        }
      }
      return user;
    }));
    toast({
      title: "Approval Updated",
      description: `${type} ${approved ? 'approved' : 'rejected'}`,
    });
  };

  const handlePermissionChange = (userId: string, permission: 'chat' | 'video' | 'audio', allowed: boolean) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        switch (permission) {
          case 'chat': return { ...user, chatAllowed: allowed };
          case 'video': return { ...user, videoCallAllowed: allowed };
          case 'audio': return { ...user, audioCallAllowed: allowed };
          default: return user;
        }
      }
      return user;
    }));
    toast({
      title: "Permission Updated",
      description: `${permission} ${allowed ? 'enabled' : 'disabled'}`,
    });
  };

  const handleBulkAction = (action: string, value?: any) => {
    setUsers(prev => prev.map(user => {
      if (selectedUsers.includes(user.id)) {
        switch (action) {
          case 'status': return { ...user, status: value };
          case 'memtype': return { ...user, memtype: value };
          case 'photo1Approve': return { ...user, photo1Approve: value };
          case 'photo2Approve': return { ...user, photo2Approve: value };
          case 'bioApproved': return { ...user, bioApproved: value };
          case 'expectationsApproved': return { ...user, expectationsApproved: value };
          case 'chatAllowed': return { ...user, chatAllowed: value };
          case 'videoCallAllowed': return { ...user, videoCallAllowed: value };
          case 'audioCallAllowed': return { ...user, audioCallAllowed: value };
          default: return user;
        }
      }
      return user;
    }));
    setSelectedUsers([]);
  };

  const refreshData = () => {
    setUsers([...mockUsers]);
    setSelectedUsers([]);
    setFilters({});
    toast({
      title: "Data Refreshed",
      description: "User data has been refreshed",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <main className="p-6 space-y-6">
        {/* Stats Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <AdminStats users={users} />
        </div>

        {/* Filters Section */}
        <UserFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          totalUsers={users.length}
          filteredUsers={filteredUsers.length}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedUsers.length}
          selectedUsers={selectedUsers}
          onSelectAll={handleSelectAll}
          onBulkAction={handleBulkAction}
          onClearSelection={handleClearSelection}
          onRefresh={refreshData}
        />

        {/* User Management Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">User Management</h2>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAll}
                disabled={filteredUsers.length === 0}
              >
                Select All ({filteredUsers.length})
              </Button>
              {selectedUsers.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                  Clear Selection
                </Button>
              )}
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                isSelected={selectedUsers.includes(user.id)}
                onSelectionChange={handleUserSelection}
                onStatusChange={handleStatusChange}
                onApproval={handleApproval}
                onPermissionChange={handlePermissionChange}
              />
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm">Try adjusting your filters or search criteria</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};