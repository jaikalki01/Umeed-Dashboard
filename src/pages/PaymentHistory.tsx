import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Payment, PaymentFilters } from "@/types/user";
import { getAllPayments } from "@/api/apihelper";

import { PaymentFilters as PaymentFiltersComponent } from "@/components/admin/PaymentFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download, IndianRupee, TrendingUp, TrendingDown, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";



export const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filters, setFilters] = useState<PaymentFilters>({} as PaymentFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Payment | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await getAllPayments();
        if (response.success && response.data) {
          setPayments(response.data);
        } else {
          setError(response.message || "Failed to fetch payments");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const getCurrencySymbol = (currency: string): string => {
    switch (currency?.toUpperCase()) {
      case "USD":
        return "$";
      case "INR":
        return "₹";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "JPY":
        return "¥";
      default:
        return currency; // fallback to code
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        !filters.searchQuery ||
        payment.email_id.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        payment.mobile_no.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        payment.order_id.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        payment.payment_id.toLowerCase().includes(filters.searchQuery.toLowerCase());

      const matchesStatus = !filters.status || payment.status === filters.status;
      const matchesCurrency = !filters.currency || payment.currency === filters.currency;

      return matchesSearch && matchesStatus && matchesCurrency;
    });
  }, [payments, filters]);

  const stats = useMemo(() => {
    const successfulPayments = payments.filter((p) => p.status === "Success");
    const failedPayments = payments.filter((p) => p.status === "Failed").length;
    const pendingPayments = payments.filter((p) => p.status === "Pending").length;

    // Group revenue by currency
    const revenueByCurrency = successfulPayments.reduce((acc, payment) => {
      const currency = payment.currency.toUpperCase();
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += payment.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert all to INR for total calculation (approximate conversion rates)
    const conversionRates: Record<string, number> = {
      'USD': 88, // 1 USD = 83 INR (approximate)
      'EUR': 90, // 1 EUR = 90 INR (approximate)
      'GBP': 105, // 1 GBP = 105 INR (approximate)
      'JPY': 0.56, // 1 JPY = 0.56 INR (approximate)
      'INR': 1, // 1 INR = 1 INR
    };

    const totalRevenueInINR = Object.entries(revenueByCurrency).reduce((total, [currency, amount]) => {
      const rate = conversionRates[currency] || 1;
      return total + (amount * rate)/100;
    }, 0);

    return {
      totalRevenue: totalRevenueInINR,
      revenueByCurrency,
      successfulPayments: successfulPayments.length,
      failedPayments,
      pendingPayments,
      successRate: payments.length > 0 ? (successfulPayments.length / payments.length) * 100 : 0,
    };
  }, [payments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success":
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-muted-foreground">Track and manage all payment transactions</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (INR)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulPayments} successful payments
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              {Object.entries(stats.revenueByCurrency).map(([currency, amount]) => (
                <div key={currency}>
                  {getCurrencySymbol(currency)}{amount.toFixed(2)} {currency}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulPayments} of {payments.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedPayments}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      <PaymentFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        totalPayments={payments.length}
        filteredPayments={filteredPayments.length}
      />

      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.user_id}</TableCell>
                  <TableCell>{payment.email_id}</TableCell>
                  <TableCell>{payment.mobile_no}</TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {getCurrencySymbol(payment.currency)}{(payment.amount/100).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payment.status)} variant="secondary">
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.currency}</TableCell>
                  <TableCell className="text-sm">{formatDate(String(payment.date))}</TableCell>
                  <TableCell className="font-mono text-xs">{payment.order_id}</TableCell>
                  <TableCell className="font-mono text-xs">{payment.payment_id}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(payment)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View User
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No payments found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
  <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>User Payment Details</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 text-sm">
        <div><strong>User ID:</strong> {selectedUser.user_id}</div>
        <div><strong>Email:</strong> {selectedUser.email_id}</div>
        <div><strong>Mobile:</strong> {selectedUser.mobile_no}</div>
        <div><strong>Currency:</strong> {selectedUser.currency}</div>
        <div><strong>Amount:</strong> {getCurrencySymbol(selectedUser.currency)}{selectedUser.amount.toFixed(2)}</div>
        <div>
          <strong>Status:</strong>
          <Badge className={getStatusColor(selectedUser.status)} variant="secondary" style={{ marginLeft: "0.5rem" }}>
            {selectedUser.status}
          </Badge>
        </div>
        <div><strong>Order ID:</strong> {selectedUser.order_id}</div>
        <div><strong>Payment ID:</strong> {selectedUser.payment_id}</div>
        <div><strong>Date:</strong> {formatDate(String(selectedUser.date))}</div>
      </div>
      <DialogClose asChild>
        <Button className="mt-4 w-full" onClick={() => setSelectedUser(null)}>
          Close
        </Button>
      </DialogClose>
    </DialogContent>
  </Dialog>
)}

    </div>
  );
};