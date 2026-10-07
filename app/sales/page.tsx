"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import {
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  CardContent,
} from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
} from "lucide-react";

export interface SaleRecordItem {
  id: string;
  transaction_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_cnic: string | null;
  customer_mobile: string | null;
  customer_address: string | null;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  remaining_balance: number;
  payment_type: "full" | "installment";
  installment_months: number;
  monthly_installment: number;
  status: string;
  created_at: string;
}

export default function SalesRecordsPage() {
  const router = useRouter();
  const { notify } = useNotification();

  const [sales, setSales] = useState<SaleRecordItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_sales: 0,
    full_payment_sales: 0,
    installment_sales: 0,
  });
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state (default 15 items per page)
  const [search, setSearch] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: any = await invoke("get_sales", {
        search: search.trim(),
        paymentType: paymentTypeFilter,
        page: currentPage,
        perPage,
      });

      setSales(res.sales || []);
      setTotalCount(res.total_count || 0);
      if (res.stats) setStats(res.stats);
    } catch (err: any) {
      notify(err?.message || "Failed to load sales records.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, paymentTypeFilter, currentPage, notify]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const totalPages = Math.ceil(totalCount / perPage) || 1;

  const selectStyle: React.CSSProperties = {
    height: "36px",
    padding: "0 12px",
    borderRadius: theme.rounded.DEFAULT,
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: theme.typography.bodyMd.fontFamily,
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: theme.spacing.lg,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.lg,
          overflowX: "hidden",
        }}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1
              style={{
                fontSize: theme.typography.headlineLg.fontSize,
                fontWeight: theme.typography.headlineLg.fontWeight,
                color: theme.colors.onSurface,
                margin: 0,
              }}
            >
              Sales Transaction Records
            </h1>
            <p
              style={{
                fontSize: theme.typography.bodyMd.fontSize,
                color: theme.colors.onSurfaceVariant,
                margin: "4px 0 0",
              }}
            >
              View detailed transactions history, line items, and payment breakdown
            </p>
          </div>

          <Button variant="primary" onClick={() => router.push("/pos")} leftIcon={<Plus size={18} />}>
            New Sale (POS)
          </Button>
        </div>

        {/* Financial Stat Cards (Blue, Purple, Emerald, Amber Schemes) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <Card style={{ backgroundColor: theme.cardSchemes.blue.background, border: `1px solid ${theme.cardSchemes.blue.border}` }}>
            <CardContent style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.blue.text, fontWeight: 700, textTransform: "uppercase" }}>
                Total Revenue
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: theme.cardSchemes.blue.titleText, marginTop: "4px" }}>
                Rs. {stats.total_revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.purple.background, border: `1px solid ${theme.cardSchemes.purple.border}` }}>
            <CardContent style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.purple.text, fontWeight: 700, textTransform: "uppercase" }}>
                Total Sales Records
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: theme.cardSchemes.purple.titleText, marginTop: "4px" }}>
                {stats.total_sales}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.emerald.background, border: `1px solid ${theme.cardSchemes.emerald.border}` }}>
            <CardContent style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.emerald.text, fontWeight: 700, textTransform: "uppercase" }}>
                Full Payment Sales
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: theme.cardSchemes.emerald.titleText, marginTop: "4px" }}>
                {stats.full_payment_sales}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.amber.background, border: `1px solid ${theme.cardSchemes.amber.border}` }}>
            <CardContent style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.amber.text, fontWeight: 700, textTransform: "uppercase" }}>
                Installment Sales
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: theme.cardSchemes.amber.titleText, marginTop: "4px" }}>
                {stats.installment_sales}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls Row (Slate Scheme) */}
        <Card style={{ backgroundColor: theme.cardSchemes.slate.background, border: `1px solid ${theme.cardSchemes.slate.border}` }}>
          <CardContent
            style={{
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1, maxWidth: "440px" }}>
              <Input
                placeholder="Search by Record ID, Customer Name, Phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={<Search size={16} />}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Filter size={16} color={theme.colors.onSurfaceVariant} />
              <span style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant, fontWeight: 500 }}>
                Payment Scheme:
              </span>
              <select
                value={paymentTypeFilter}
                onChange={(e) => {
                  setPaymentTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={selectStyle}
              >
                <option value="all" style={{ backgroundColor: "#ffffff", color: "#0f172a" }}>All Schemes</option>
                <option value="full" style={{ backgroundColor: "#ffffff", color: "#0f172a" }}>Full Payment Only</option>
                <option value="installment" style={{ backgroundColor: "#ffffff", color: "#0f172a" }}>Installment Plan Only</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Clean Sales Records Data Table (Showing ONLY: Record ID, Customer Name & Mobile, Paid Amount, Payment Status, Action) */}
        <Card style={{ padding: 0, overflow: "hidden", border: "1.5px solid #cbd5e1" }}>
          <div style={{ width: "100%", overflowX: "auto" }}>
            {loading ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: theme.colors.onSurfaceVariant, fontSize: "14px" }}>
                Loading sales records...
              </div>
            ) : sales.length === 0 ? (
              <div style={{ padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "16px" }}>
                <Receipt size={36} color={theme.colors.onSurfaceVariant} />
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 600, color: theme.colors.onSurface }}>
                    {search ? "No matching sales records found" : "No Sales Records Yet"}
                  </h3>
                  <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant, maxWidth: "380px" }}>
                    {search ? `No transaction matches "${search}". Try adjusting your keywords.` : "No sales have been processed yet. Complete your first sale in POS."}
                  </p>
                </div>
                {!search && (
                  <Button variant="primary" onClick={() => router.push("/pos")} leftIcon={<Plus size={18} />}>
                    Go to POS
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow isHeader style={{ backgroundColor: "#f8fafc" }}>
                    <TableHead>#</TableHead>
                    <TableHead>TRANSACTION NO.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead align="right">Paid Amount</TableHead>
                    <TableHead align="center">Payment Status</TableHead>
                    <TableHead align="center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale, index) => {
                    const isInstallment = sale.payment_type === "installment";

                    return (
                      <TableRow key={sale.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        {/* Index */}
                        <TableCell isNumeric style={{ color: theme.colors.onSurfaceVariant }}>
                          {(currentPage - 1) * perPage + index + 1}
                        </TableCell>

                        {/* Transaction Number */}
                        <TableCell style={{ fontWeight: 700, color: theme.colors.primary, fontFamily: "monospace" }}>
                          {sale.transaction_number || sale.id.replace("sale_", "TXN-")}
                        </TableCell>

                        {/* Customer: Name & Mobile Only */}
                        <TableCell>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 700, color: theme.colors.onSurface, fontSize: "13.5px" }}>
                              {sale.customer_name}
                            </span>
                            {sale.customer_mobile && (
                              <span style={{ fontSize: "12px", color: theme.colors.onSurfaceVariant }}>
                                Mobile: {sale.customer_mobile}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Paid Amount */}
                        <TableCell isNumeric style={{ fontWeight: 800, color: "#15803d" }}>
                          {sale.paid_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>

                        {/* Payment Status Pill Badge */}
                        <TableCell align="center">
                          <div
                            style={{
                              display: "inline-flex",
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              backgroundColor: isInstallment ? "#e0f2fe" : "#dcfce7",
                              color: isInstallment ? "#0369a1" : "#15803d",
                              border: `1px solid ${isInstallment ? "#bae6fd" : "#86efac"}`,
                            }}
                          >
                            {isInstallment ? `Installments (${sale.installment_months} Mos)` : "Full Payment"}
                          </div>
                        </TableCell>

                        {/* Action: View Details */}
                        <TableCell align="center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/sales/details?id=${sale.id}`)}
                            leftIcon={<Eye size={14} />}
                            style={{ padding: "0 12px", height: "30px", fontSize: "12px" }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Table Footer Pagination */}
          {!loading && totalCount > 0 && (
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#ffffff",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              <div>
                Showing <strong style={{ color: "#0f172a" }}>{(currentPage - 1) * perPage + 1}</strong> to{" "}
                <strong style={{ color: "#0f172a" }}>{Math.min(currentPage * perPage, totalCount)}</strong> of{" "}
                <strong style={{ color: "#0f172a" }}>{totalCount}</strong> sale records
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  leftIcon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  rightIcon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
