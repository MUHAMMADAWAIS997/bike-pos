"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Eye,
  RefreshCw,
  Truck,
  Phone,
  MapPin,
  Calendar,
  Layers,
  DollarSign,
  Package,
} from "lucide-react";

export interface StockBatchRow {
  id: string;
  batch_no: string;
  supplier_company: string;
  total_items: number;
  total_quantity: number;
  total_value: number;
  created_at: string;
}

export interface SupplierProfile {
  id: string;
  company: string;
  mobile: string;
  address?: string | null;
  created_at: string;
}

export interface SupplierLedgerStats {
  total_batches: number;
  total_units: number;
  total_investment: number;
}

// Helper to get 1st day of current month to today's date
const getInitialDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${day}`,
  };
};

function SupplierLedgerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useNotification();

  const companyParam = searchParams.get("company") || searchParams.get("id") || "";

  const initialDates = getInitialDates();
  const [supplier, setSupplier] = useState<SupplierProfile>({
    id: "supp_101",
    company: companyParam || "VoltMotors Supply Ltd",
    mobile: "03001234567",
    address: "Plot 12, Industrial Area, Sector I-9, Islamabad",
    created_at: "2026-08-18 10:00:00",
  });

  const [batches, setBatches] = useState<StockBatchRow[]>([]);
  const [stats, setStats] = useState<SupplierLedgerStats>({
    total_batches: 0,
    total_units: 0,
    total_investment: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10; // Enforce 10 records per page
  const [totalCount, setTotalCount] = useState(0);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: any = await invoke("get_supplier_ledger", {
        supplierCompany: companyParam || supplier.company,
        search: search.trim(),
        startDate,
        endDate,
        page: currentPage,
        perPage,
      });

      if (res) {
        if (res.supplier) setSupplier(res.supplier);
        setBatches(res.batches || []);
        setTotalCount(res.total_count || 0);
        if (res.stats) setStats(res.stats);
      }
    } catch (err: any) {
      console.error("Failed to fetch supplier ledger", err);
      notify("Failed to load supplier ledger history.", "error");
    } finally {
      setLoading(false);
    }
  }, [companyParam, supplier.company, search, startDate, endDate, currentPage, perPage, notify]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleResetFilters = () => {
    setSearch("");
    setStartDate(initialDates.start);
    setEndDate(initialDates.end);
    setCurrentPage(1);
  };

  const formatCurrency = (val: number) => {
    return `Rs. ${val.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalPages = Math.ceil(totalCount / perPage) || 1;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: "24px",
          maxWidth: "1400px",
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          overflowX: "hidden",
          margin: "0 auto",
        }}
      >
        {/* Top Navigation & Header */}
        <div style={{ marginBottom: "20px" }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/supplier")}
            leftIcon={<ArrowLeft size={16} />}
            style={{ marginBottom: "16px" }}
          >
            Back to Suppliers
          </Button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <Truck size={26} color={theme.colors.primary} />
                <h1
                  style={{
                    fontSize: "26px",
                    fontFamily: theme.typography.display.fontFamily,
                    fontWeight: "700",
                    color: theme.colors.onSurface,
                    margin: 0,
                  }}
                >
                  {supplier.company}
                </h1>
              </div>

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={14} color={theme.colors.primary} />
                  {supplier.mobile}
                </span>
                {supplier.address && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={14} color={theme.colors.primary} />
                    {supplier.address}
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                fetchLedger();
                notify("Ledger history refreshed", "info");
              }}
              leftIcon={<RefreshCw size={16} className={loading ? "animate-spin" : ""} />}
            >
              Refresh Ledger
            </Button>
          </div>
        </div>

        {/* Supplier Summary KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {/* Card 1: Total Intake Batches — Blue Scheme */}
          <Card style={{ backgroundColor: theme.cardSchemes.blue.background, border: `1px solid ${theme.cardSchemes.blue.border}`, borderRadius: theme.rounded.xl }}>
            <CardContent style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.blue.titleText, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Total Intake Batches
                </span>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: theme.cardSchemes.blue.badgeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Layers size={20} color={theme.cardSchemes.blue.accent} />
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: theme.cardSchemes.blue.titleText }}>
                {stats.total_batches} Batches
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Total Units Received — Purple Scheme */}
          <Card style={{ backgroundColor: theme.cardSchemes.purple.background, border: `1px solid ${theme.cardSchemes.purple.border}`, borderRadius: theme.rounded.xl }}>
            <CardContent style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.purple.titleText, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Total Units Received
                </span>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: theme.cardSchemes.purple.badgeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={20} color={theme.cardSchemes.purple.accent} />
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: theme.cardSchemes.purple.titleText }}>
                {stats.total_units} Units
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Total Supplier Investment — Emerald Scheme */}
          <Card style={{ backgroundColor: theme.cardSchemes.emerald.background, border: `1px solid ${theme.cardSchemes.emerald.border}`, borderRadius: theme.rounded.xl }}>
            <CardContent style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.emerald.titleText, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Total Supplier Investment
                </span>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: theme.cardSchemes.emerald.badgeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign size={20} color={theme.cardSchemes.emerald.accent} />
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: theme.cardSchemes.emerald.accent }}>
                {formatCurrency(stats.total_investment)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls Bar */}
        <Card style={{ backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.rounded.lg, border: `1px solid ${theme.colors.outlineVariant}`, marginBottom: "20px" }}>
          <CardContent style={{ padding: "16px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              {/* Search Box */}
              <div style={{ flex: "1 1 240px", position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "11px", color: theme.colors.onSurfaceVariant }} />
                <input
                  type="text"
                  placeholder="Search batch number..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: "100%",
                    paddingLeft: "36px",
                    paddingRight: "12px",
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    border: `1px solid ${theme.colors.disabledBorder}`,
                    borderRadius: theme.rounded.DEFAULT,
                    fontSize: "14px",
                    outline: "none",
                    color: theme.colors.onSurface,
                    backgroundColor: "#ffffff",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Default Current Month Date Pickers */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "7px 10px",
                    border: `1px solid ${theme.colors.disabledBorder}`,
                    borderRadius: theme.rounded.DEFAULT,
                    fontSize: "13px",
                    color: theme.colors.onSurface,
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant }}>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "7px 10px",
                    border: `1px solid ${theme.colors.disabledBorder}`,
                    borderRadius: theme.rounded.DEFAULT,
                    fontSize: "13px",
                    color: theme.colors.onSurface,
                    outline: "none",
                  }}
                />
              </div>

              {/* Reset Filters */}
              {(search || startDate !== initialDates.start || endDate !== initialDates.end) && (
                <Button onClick={handleResetFilters} variant="outline" size="sm">
                  Reset (Current Month)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Ledger Table Card */}
        <Card style={{ backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.rounded.lg, border: `1px solid ${theme.colors.outlineVariant}`, overflow: "hidden" }}>
          <Table>
            <TableHeader>
              <TableRow isHeader>
                <TableHead>Date & Time</TableHead>
                <TableHead>Batch No</TableHead>
                <TableHead align="center">Line Items</TableHead>
                <TableHead align="center">Total Quantity (Units)</TableHead>
                <TableHead align="right">Total Batch Value (PKR)</TableHead>
                <TableHead align="center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" style={{ padding: "40px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <RefreshCw size={28} color={theme.colors.primary} className="animate-spin" />
                      <p style={{ margin: 0, color: theme.colors.onSurfaceVariant, fontSize: "14px" }}>Loading supplier ledger history...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" style={{ padding: "48px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <Boxes size={40} color={theme.colors.outline} />
                      <div>
                        <p style={{ margin: "0 0 4px 0", fontWeight: 600, fontSize: "16px", color: theme.colors.onSurface }}>
                          No Batch Intake Records Found
                        </p>
                        <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant }}>
                          No stock intake batches recorded for {supplier.company} matching the date filter range.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
                      {batch.created_at || "N/A"}
                    </TableCell>

                    <TableCell style={{ fontWeight: 600, fontFamily: "monospace", color: theme.colors.onSurface }}>
                      <span style={{ backgroundColor: theme.colors.surfaceContainerLow, padding: "3px 8px", borderRadius: "4px" }}>
                        {batch.batch_no}
                      </span>
                    </TableCell>

                    <TableCell align="center" style={{ fontSize: "13px", color: theme.colors.onSurface }}>
                      {batch.total_items} Items
                    </TableCell>

                    <TableCell align="center" style={{ fontWeight: 600, color: theme.colors.secondary }}>
                      {batch.total_quantity} Units
                    </TableCell>

                    <TableCell align="right" isNumeric style={{ fontWeight: 700, fontSize: "14px", color: theme.colors.success }}>
                      {formatCurrency(batch.total_value)}
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/stock-control/details?id=${encodeURIComponent(batch.id)}`)}
                        leftIcon={<Eye size={15} />}
                        title="View Detailed Batch Invoice"
                      >
                        View Invoice Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Table Footer Pagination */}
          {!loading && batches.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderTop: `1px solid ${theme.colors.disabledBorder}`,
                backgroundColor: theme.colors.surfaceContainerLow,
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalCount)} of {totalCount} batch entries
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>

                <span style={{ fontSize: "13px", fontWeight: 600, color: theme.colors.onSurface, padding: "0 8px" }}>
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

export default function SupplierLedgerPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Supplier Ledger...</div>}>
      <SupplierLedgerContent />
    </Suspense>
  );
}
