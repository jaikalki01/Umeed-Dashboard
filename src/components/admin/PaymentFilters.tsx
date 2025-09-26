import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PaymentFilters as PaymentFiltersType } from "@/types/user";


interface PaymentFiltersProps {
  filters: PaymentFiltersType;
  onFiltersChange: (filters: PaymentFiltersType) => void;
  totalPayments: number;
  filteredPayments: number;
}

export const PaymentFilters = ({ filters, onFiltersChange, totalPayments, filteredPayments }: PaymentFiltersProps) => {
  const updateFilter = (key: keyof PaymentFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ currency: undefined });
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== "" && value !== null
  ).length;

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Payment Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredPayments} of {totalPayments} payments
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, emails, transactions..."
            value={filters.searchQuery || ""}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            className="pl-10"
          />
        </div>

        <Select 
          value={filters.status || "all"} 
          onValueChange={(value) => updateFilter("status", value === "all" ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Success">Success</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.planType || "all"} 
          onValueChange={(value) => updateFilter("planType", value === "all" ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Plan Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="Free">Free</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Exclusive">Exclusive</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.paymentMethod || "all"} 
          onValueChange={(value) => updateFilter("paymentMethod", value === "all" ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="Debit Card">Debit Card</SelectItem>
            <SelectItem value="PayPal">PayPal</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeFiltersCount > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearFilters}
          className="w-fit"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};