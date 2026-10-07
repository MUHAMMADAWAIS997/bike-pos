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
import {
  TrendingUp,
  RefreshCw,
  Award,
  CheckCircle2,
  DollarSign,
  Package,
  Plus,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { AddIncentiveModal, RevenueSummaryItemRow } from "@/components/revenue/add-incentive-modal";

export interface RevenueSummaryStats {
  total_revenue: number;
  total_initial_profit: number;
  total_fee_profit: number;
  total_incentives: number;
  total_net_profit: number;
  total_units_sold: number;
}

const getCurrentMonthYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export default function RevenueSummaryPage() {
  const { notify } = useNotification();

  const [monthYear, setMonthYear] = useState<string>(getCurrentMonthYear());
  const [search, setSearch] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const [items, setItems] = useState<RevenueSummaryItemRow[]>([]);
  const [stats, setStats] = useState<RevenueSummaryStats>({
    total_revenue: 0,
    total_initial_profit: 0,
    total_fee_profit: 0,
    total_incentives: 0,
    total_net_profit: 0,
    total_units_sold: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedItemForIncentive, setSelectedItemForIncentive] = useState<RevenueSummaryItemRow | null>(null);
  const [isIncentiveModalOpen, setIsIncentiveModalOpen] = useState(false);

  // Pagination (10 records per page)
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [totalCount, setTotalCount] = useState(0);

  // Load available categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const prodRes: any = await invoke("get_products", {
          search: "",
          category: "all",
          model: "all",
          orderBy: "model_asc",
          page: 1,
          perPage: 100,
        });
        if (prodRes?.categories && Array.isArray(prodRes.categories)) {
          setAvailableCategories(prodRes.categories.filter((c: string) => c && c.trim().length > 0));
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    loadCategories();
  }, []);

  const fetchRevenueSummary = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: any = await invoke("get_revenue_summary", {
        monthYear,
        search: search.trim() || null,
        paymentTypeFilter: paymentTypeFilter !== "all" ? paymentTypeFilter : null,
        categoryFilter: categoryFilter !== "all" ? categoryFilter : null,
      });

      if (res) {
        setItems(res.items || []);
        setTotalCount(res.total_count || 0);
        if (res.stats) setStats(res.stats);
      }
    } catch (err: any) {
      console.error("Failed to fetch revenue summary", err);
      notify("Failed to load current month revenue summary.", "error");
    } finally {
      setLoading(false);
    }
  }, [monthYear, search, paymentTypeFilter, categoryFilter, notify]);

  useEffect(() => {
    fetchRevenueSummary();
  }, [fetchRevenueSummary]);

  const formatCurrency = (val: number) => {
    return `Rs. ${val.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalPages = Math.ceil(totalCount / perPage) || 1;
  const paginatedItems = items.slice((currentPage - 1) * perPage, currentPage * perPage);

  const selectStyle: React.CSSProperties = {
    width: "100%",
    height: "36px",
    padding: "0 12px",
    borderRadius: theme.rounded.md,
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: theme.colors.onSurface,
    fontSize: "13px",
    fontFamily: theme.typography.bodyMd.fontFamily,
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  };

  // CSV Export Handler for Summary Stats & Filtered Data Table
  const handleExportCSV = () => {
    if (items.length === 0) {
      notify("No revenue summary records available to export.", "warning");
      return;
    }

    const reportHeaders = [
      "REVENUE SUMMARY REPORT",
      `Month/Year,${monthYear}`,
      `Filter Search,${search ? `"${search.replace(/"/g, '""')}"` : "None"}`,
      `Filter Payment Scheme,${paymentTypeFilter === "all" ? "All Payment Schemes" : paymentTypeFilter === "full" ? "Full Payment" : "Installments"}`,
      `Filter Category,${categoryFilter === "all" ? "All Categories" : categoryFilter}`,
      `Generated On,${new Date().toLocaleString()}`,
      "",
      "SUMMARY STATISTICS",
      "Total Revenue (Rs.),Cost Margin Profit (Rs.),Markup Fee Profit (Rs.),Company Incentives (Rs.),Total Net Profit (Rs.),Total Units Sold",
      `"${stats.total_revenue.toFixed(2)}","${stats.total_initial_profit.toFixed(2)}","${stats.total_fee_profit.toFixed(2)}","${stats.total_incentives.toFixed(2)}","${stats.total_net_profit.toFixed(2)}",${stats.total_units_sold}`,
      "",
      "PRODUCT REVENUE & PROFIT BREAKDOWN DETAILS",
      "#,Product Model,Payment Type,Installment Months,Retail Price (Rs.),Sold Price (Rs.),Discount Amount (Rs.),Cost Price (Rs.),Units Sold,Recognized Revenue (Rs.),Recognized Cost (Rs.),Fee Profit (Rs.),Initial Profit (Rs.),Incentive %,Incentive Amount (Rs.),Total Net Profit (Rs.)",
    ];

    const dataRows = items.map((item, index) => {
      const ptypeLabel =
        item.payment_type === "full"
          ? "Full Paid"
          : item.installment_number
          ? `Installment #${item.installment_number} (${item.installment_number} of ${item.installment_months} mos)`
          : `Installments (${item.installment_months} mos)`;
      return [
        index + 1,
        `"${(item.product_model || "").replace(/"/g, '""')}"`,
        `"${ptypeLabel}"`,
        item.installment_months || 1,
        item.retail_price.toFixed(2),
        (item.sold_price ?? item.retail_price).toFixed(2),
        (item.discount_amount ?? 0).toFixed(2),
        item.cost_price.toFixed(2),
        item.quantity_sold,
        item.total_sales.toFixed(2),
        item.recognized_cost.toFixed(2),
        item.fee_profit.toFixed(2),
        item.initial_profit.toFixed(2),
        `${item.incentive_percentage}%`,
        item.incentive_amount.toFixed(2),
        item.total_profit.toFixed(2),
      ].join(",");
    });

    const csvContent = [...reportHeaders, ...dataRows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Revenue_Summary_Report_${monthYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    notify(`Exported ${items.length} records to Revenue_Summary_Report_${monthYear}.csv`, "success");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: "24px",
          maxWidth: "1500px",
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          overflowX: "hidden",
          margin: "0 auto",
        }}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <TrendingUp size={28} color={theme.colors.primary} />
              <h1
                style={{
                  fontSize: "28px",
                  fontFamily: theme.typography.display.fontFamily,
                  fontWeight: "700",
                  color: theme.colors.onSurface,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Revenue Summary
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant }}>
              Track product sales, cost margins (RP − Cost), and monthly store profit incentives
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <Button
              variant="primary"
              onClick={() => setIsIncentiveModalOpen(true)}
              leftIcon={<Plus size={16} />}
            >
              Add Monthly Incentive
            </Button>

            <Button
              variant="outline"
              onClick={handleExportCSV}
              leftIcon={<Download size={16} />}
            >
              Save Report (CSV)
            </Button>
          </div>
        </div>

        {/* Revenue KPI Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <Card style={{ backgroundColor: theme.cardSchemes.blue.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.blue.border}` }}>
            <CardContent style={{ padding: "20px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.blue.text }}>
                Total Sales Revenue
              </p>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: theme.cardSchemes.blue.titleText }}>
                {formatCurrency(stats.total_revenue)}
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: theme.cardSchemes.blue.text }}>
                {stats.total_units_sold} Units Sold ({monthYear})
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.purple.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.purple.border}` }}>
            <CardContent style={{ padding: "20px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.purple.text }}>
                Initial Profit
              </p>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: theme.cardSchemes.purple.titleText }}>
                {formatCurrency(stats.total_initial_profit)}
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: theme.cardSchemes.purple.text }}>
                Cost Margin (RP − Cost)
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.slate.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.slate.border}` }}>
            <CardContent style={{ padding: "20px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 700, color: "#d97706" }}>
                Markup Fee Profit
              </p>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#b45309" }}>
                {formatCurrency(stats.total_fee_profit)}
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: theme.cardSchemes.slate.text }}>
                Installment Markup Surcharges
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.amber.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.amber.border}` }}>
            <CardContent style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.amber.text }}>
                  Monthly Incentive
                </p>
                <button
                  onClick={() => setIsIncentiveModalOpen(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.cardSchemes.amber.titleText,
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  {stats.total_incentives > 0 ? "Edit" : "+ Add"}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: theme.cardSchemes.amber.titleText }}>
                {formatCurrency(stats.total_incentives)}
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: theme.cardSchemes.amber.text }}>
                One-time monthly bonus ({monthYear})
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.emerald.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.emerald.border}` }}>
            <CardContent style={{ padding: "20px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.emerald.text }}>
                Net Total Profit
              </p>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: theme.cardSchemes.emerald.titleText }}>
                {formatCurrency(stats.total_net_profit)}
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: theme.cardSchemes.emerald.text }}>
                Initial + Fee + Monthly Incentive
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            backgroundColor: "#ffffff",
            padding: "14px 18px",
            borderRadius: theme.rounded.lg,
            border: "1px solid #cbd5e1",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {/* Search Input */}
          <div style={{ flex: "1 1 240px", minWidth: "200px" }}>
            <Input
              placeholder="Search product model name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search size={16} />}
              style={{ height: "36px", fontSize: "13px" }}
            />
          </div>

          {/* Payment Type Filter Dropdown */}
          <div style={{ flex: "0 0 190px" }}>
            <select
              value={paymentTypeFilter}
              onChange={(e) => {
                setPaymentTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={selectStyle}
            >
              <option value="all">All Payment Schemes</option>
              <option value="full">Full Payment</option>
              <option value="installment">Installments</option>
            </select>
          </div>

          {/* Category Filter Dropdown */}
          <div style={{ flex: "0 0 170px" }}>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={selectStyle}
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter Picker */}
          <input
            type="month"
            value={monthYear}
            onChange={(e) => {
              setMonthYear(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              height: "36px",
              padding: "0 12px",
              border: "1.5px solid #cbd5e1",
              borderRadius: theme.rounded.md,
              fontSize: "13px",
              color: "#0c4a6e",
              fontWeight: 600,
              outline: "none",
              backgroundColor: "#f0f9ff",
              cursor: "pointer",
            }}
          />

          {/* Refresh Button */}
          <Button
            onClick={() => {
              fetchRevenueSummary();
              notify("Revenue summary refreshed", "info");
            }}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={15} className={loading ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
        </div>
        {/* Revenue Summary Table */}
        <Card style={{ backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.rounded.lg, border: `1px solid ${theme.colors.outlineVariant}`, overflow: "hidden" }}>
          <Table>
            <TableHeader>
              <TableRow isHeader>
                <TableHead>Product Name</TableHead>
                <TableHead align="center">Payment Type</TableHead>
                <TableHead align="right">Retail Price (RP)</TableHead>
                <TableHead align="center">Qty Sold</TableHead>
                <TableHead align="right">Recognized Revenue</TableHead>
                <TableHead align="right">Markup Fee Profit</TableHead>
                <TableHead align="right">Initial Profit</TableHead>
                <TableHead align="right">Total Product Profit</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" style={{ padding: "40px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <RefreshCw size={28} color={theme.colors.primary} className="animate-spin" />
                      <p style={{ margin: 0, color: theme.colors.onSurfaceVariant, fontSize: "14px" }}>Loading revenue summary for {monthYear}...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" style={{ padding: "48px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <Boxes size={40} color={theme.colors.outline} />
                      <div>
                        <p style={{ margin: "0 0 4px 0", fontWeight: 600, fontSize: "16px", color: theme.colors.onSurface }}>
                          No Sales Recorded in {monthYear}
                        </p>
                        <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant }}>
                          No product or motorcycle sales transactions found for the selected month.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item, idx) => {
                  const isInstallment = item.payment_type.startsWith("installment");
                  const instNum = item.installment_number || 1;
                  const ptypeBadgeText =
                    item.payment_type === "full"
                      ? "Full Paid"
                      : `Installment #${instNum} (${instNum} of ${item.installment_months} mos)`;
                  const hasDisc = (item.discount_amount ?? 0) > 0;

                  return (
                    <TableRow key={`${item.product_id}_${item.payment_type}_${idx}`}>
                      <TableCell style={{ fontWeight: 600, color: theme.colors.onSurface }}>
                        {item.product_model}
                      </TableCell>

                      <TableCell align="center">
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 700,
                            backgroundColor: isInstallment ? "#fef3c7" : "#e0f2fe",
                            color: isInstallment ? "#92400e" : "#0369a1",
                            border: `1px solid ${isInstallment ? "#fcd34d" : "#bae6fd"}`,
                          }}
                        >
                          {ptypeBadgeText}
                        </span>
                      </TableCell>

                      <TableCell align="right" isNumeric style={{ fontSize: "13px" }}>
                        <div>
                          <div style={{ fontWeight: 600, color: theme.colors.onSurface }}>
                            {formatCurrency(item.retail_price)}
                          </div>
                          {hasDisc ? (
                            <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 700 }}>
                              (-{formatCurrency(item.discount_amount!)} disc)
                            </div>
                          ) : (
                            <div style={{ fontSize: "11px", color: theme.colors.outline }}>
                              (Full RP)
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell align="center" style={{ fontWeight: 600, color: theme.colors.secondary }}>
                        {item.quantity_sold} Units
                      </TableCell>

                      <TableCell align="right" isNumeric style={{ fontWeight: 600, color: theme.colors.primary }}>
                        {formatCurrency(item.total_sales)}
                      </TableCell>

                      <TableCell align="right" isNumeric style={{ fontSize: "13px", fontWeight: 600, color: isInstallment ? "#d97706" : theme.colors.outline }}>
                        {item.fee_profit > 0 ? formatCurrency(item.fee_profit) : "—"}
                      </TableCell>

                      <TableCell align="right" isNumeric style={{ fontSize: "13px", color: theme.colors.onSurface }}>
                        {formatCurrency(item.initial_profit)}
                      </TableCell>

                      <TableCell align="right" isNumeric style={{ fontWeight: 800, fontSize: "14px", color: theme.colors.success }}>
                        {formatCurrency(item.total_profit)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Table Footer Pagination */}
          {!loading && totalCount > 0 && (
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
                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalCount)} of {totalCount} records
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

        {/* Add Monthly Incentive Modal */}
        <AddIncentiveModal
          isOpen={isIncentiveModalOpen}
          onClose={() => {
            setIsIncentiveModalOpen(false);
          }}
          defaultMonthYear={monthYear}
          baseMonthProfit={stats.total_initial_profit + stats.total_fee_profit}
          onIncentiveSaved={() => {
            fetchRevenueSummary();
          }}
        />
      </main>
    </div>
  );
}
