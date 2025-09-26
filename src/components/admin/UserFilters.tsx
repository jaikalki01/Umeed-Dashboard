import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserFilters as UserFiltersType } from "@/types/user";
import { genderOptions, membershipOptions } from "@/types/user";
import { Search, Filter, X } from "lucide-react";

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  totalUsers: number;
  filteredUsers: number;
}

export const UserFilters = ({ filters, onFiltersChange, totalUsers, filteredUsers }: UserFiltersProps) => {
  const updateFilter = (key: keyof UserFiltersType | "online", value: any) => {
    onFiltersChange({ ...filters, [key]: value } as UserFiltersType & { online?: boolean });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== "").length;

  return (
    <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Showing {filteredUsers} of {totalUsers} users</span>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={(filters as any).searchQuery || ""}
            onChange={(e) => updateFilter("searchQuery" as any, e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status */}
        <Select value={(filters as any).status || "all"} onValueChange={(value) => updateFilter("status", value === "all" ? undefined : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Banned">Banned</SelectItem>
            <SelectItem value="Deleted">Deleted</SelectItem>
            <SelectItem value="Exclusive">Exclusive</SelectItem>
          </SelectContent>
        </Select>

        {/* Membership */}
        <Select value={(filters as any).memtype || "all"} onValueChange={(value) => updateFilter("memtype", value === "all" ? undefined : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>

            {/* {membershipOptions.map(option => (
              <SelectItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </SelectItem>
            ))} */}


      
            <SelectItem value="Free">Free</SelectItem>
            <SelectItem value="basic_chat_pack">Basic Chat Pack</SelectItem>
            <SelectItem value="standard_pack">Standard Pack</SelectItem>
            <SelectItem value="weekly_pack">Weekly Pack</SelectItem>
            <SelectItem value="12-day_pack">12-Day Pack</SelectItem>
            <SelectItem value="monthly_pack">Monthly Pack</SelectItem>
            <SelectItem value="exclusive_member">Exclusive Member</SelectItem>

          </SelectContent>
        </Select>

        {/* Gender */}
        <Select value={(filters as any).gender || "all"} onValueChange={(value) => updateFilter("gender", value === "all" ? undefined : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Genders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            {genderOptions.map(option => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Additional Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Photo 1 */}
        <Select
          value={(filters as any).photo1Approve === undefined ? "all" : String((filters as any).photo1Approve)}
          onValueChange={(value) => updateFilter("photo1Approve", value === "all" ? undefined : value === "true")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Photo 1 Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Photo 1</SelectItem>
            <SelectItem value="true">Photo 1 Approved</SelectItem>
            <SelectItem value="false">Photo 1 Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Photo 2 */}
        <Select
          value={(filters as any).photo2Approve === undefined ? "all" : String((filters as any).photo2Approve)}
          onValueChange={(value) => updateFilter("photo2Approve", value === "all" ? undefined : value === "true")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Photo 2 Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Photo 2</SelectItem>
            <SelectItem value="true">Photo 2 Approved</SelectItem>
            <SelectItem value="false">Photo 2 Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Bio */}
        <Select
          value={(filters as any).bioApproved === undefined ? "all" : String((filters as any).bioApproved)}
          onValueChange={(value) => updateFilter("bioApproved", value === "all" ? undefined : value === "true")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Bio Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bios</SelectItem>
            <SelectItem value="true">Bio Approved</SelectItem>
            <SelectItem value="false">Bio Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Expectations */}
        <Select
          value={(filters as any).expectationsApproved === undefined ? "all" : String((filters as any).expectationsApproved)}
          onValueChange={(value) => updateFilter("expectationsApproved", value === "all" ? undefined : value === "true")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Expectations Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Expectations</SelectItem>
            <SelectItem value="true">Expectations Approved</SelectItem>
            <SelectItem value="false">Expectations Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* ✅ Online/Offline */}
        <Select
          value={(filters as any).online === undefined ? "all" : ((filters as any).online ? "true" : "false")}
          onValueChange={(value) => updateFilter("online", value === "all" ? undefined : value === "true")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Online Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="true">Online</SelectItem>
            <SelectItem value="false">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
