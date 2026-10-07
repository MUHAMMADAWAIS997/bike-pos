"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  CreditCard,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Boxes,
  Plus,
  RefreshCw,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle,
  Package,
} from "lucide-react";

export interface DashboardSummaryData {
  current_month_year: string;
  monthly_revenue: number;
  monthly_net_profit: number;
  monthly_expenses: number;
  monthly_units_sold: number;
  stock_expenses: number;
  operational_expenses: number;
  total_products_count: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

export interface LowStockItem {
  id: string;
  model: string;
  category: string;
  color: string;
  quantity: number;
  retail_price: number;
  cost_price: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { notify } = useNotification();

  // Period filter state: "this_month" (active by default), "this_year", "all_time"
  const [periodFilter, setPeriodFilter] = useState<string>("this_month");

  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [lowStockList, setLowStockList] = useState<LowStockItem[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportingReport, setExportingReport] = useState<string | null>(null);
  const [reportFormat, setReportFormat] = useState<"csv" | "txt">("csv");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const settings: any = await invoke("get_shop_settings").catch(() => null);
      const thresh = settings?.low_stock_threshold || 2;
      setLowStockThreshold(thresh);

      const sumData: DashboardSummaryData = await invoke("get_dashboard_summary", { monthYear: periodFilter });
      const lowData: LowStockItem[] = await invoke("get_low_stock_products", { threshold: thresh });

      setSummary(sumData);
      setLowStockList(lowData || []);
    } catch (err: any) {
      console.error("Failed to load dashboard data", err);
      notify(err?.toString() || "Failed to load dashboard statistics.", "error");
    } finally {
      setLoading(false);
    }
  }, [periodFilter, notify]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Dynamic Card Titles & Subtexts based on active period filter
  const getPeriodLabels = () => {
    if (periodFilter === "this_year") {
      return {
        revenueTitle: "Annual Revenue",
        profitTitle: "Annual Net Profit",
        expensesTitle: "Annual Expenses",
        unitText: "Units sold this year",
      };
    }
    if (periodFilter === "all_time") {
      return {
        revenueTitle: "All Time Revenue",
        profitTitle: "All Time Net Profit",
        expensesTitle: "All Time Expenses",
        unitText: "Units sold overall",
      };
    }
    return {
      revenueTitle: "Monthly Revenue",
      profitTitle: "Monthly Net Profit",
      expensesTitle: "Monthly Expenses",
      unitText: "Units sold this month",
    };
  };

  const labels = getPeriodLabels();

  // One-Click Native Desktop Report Saver (Opens File Explorer Save Dialog)
  const handleExportNativeReport = async (reportType: "sales" | "expenses" | "summary") => {
    setExportingReport(reportType);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const savedFilePath: string = await invoke("export_native_report", {
        reportType,
        monthYear: periodFilter,
        fileFormat: reportFormat,
      });

      if (savedFilePath) {
        notify(`Report saved successfully to: ${savedFilePath}`, "success");
      }
    } catch (err: any) {
      if (err && err.toString().includes("cancelled")) {
        notify("Report export cancelled.", "info");
      } else {
        console.error("Report export failed", err);
        notify(err?.toString() || "Failed to export report.", "error");
      }
    } finally {
      setExportingReport(null);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "28px 36px", overflowY: "auto" }}>
        {/* Top Title Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: theme.typography.display.fontFamily,
                fontSize: theme.typography.headlineLg.fontSize,
                fontWeight: theme.typography.headlineLg.fontWeight,
                color: theme.colors.onSurface,
                margin: "0 0 6px 0",
              }}
            >
              Executive Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant }}>
              Real-time store metrics, inventory alerts, and one-click desktop financial reports.
            </p>
          </div>

          {/* Period Filter Selector (Dropdown with 'this_month' active by default) */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: theme.colors.surfaceContainerLowest,
                border: `1.5px solid ${theme.colors.outlineVariant}`,
                borderRadius: theme.rounded.DEFAULT,
                padding: "4px 12px",
                height: "36px",
              }}
            >
              <Calendar size={16} color={theme.colors.primary} />
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontFamily: theme.typography.bodyMd.fontFamily,
                  fontSize: "13.5px",
                  fontWeight: 700,
                  color: theme.colors.onSurface,
                  cursor: "pointer",
                }}
              >
                <option value="this_month">This Month</option>
                <option value="this_year">This Year</option>
                <option value="all_time">All Time</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={loading}
              leftIcon={<RefreshCw size={15} className={loading ? "animate-spin" : ""} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* 1. TOP STAT CARDS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "28px" }}>
          {/* Card 1: Sales Revenue (Blue Scheme) */}
          <Card style={{ backgroundColor: theme.cardSchemes.blue.background, border: `1px solid ${theme.cardSchemes.blue.border}`, borderRadius: theme.rounded.xl }}>
            <CardContent style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.blue.titleText, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {labels.revenueTitle}
                </span>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: theme.cardSchemes.blue.badgeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign size={20} color={theme.cardSchemes.blue.accent} />
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: theme.cardSchemes.blue.titleText, marginBottom: "4px" }}>
                Rs. {summary?.monthly_revenue?.toLocaleString() || "0"}
              </div>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.blue.text, display: "flex", alignItems: "center", gap: "4px" }}>
                <Package size={14} color={theme.cardSchemes.blue.accent} />
                <span><strong>{summary?.monthly_units_sold || 0}</strong> {labels.unitText}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Net Profit (Emerald Scheme) */}
          <Card style={{ backgroundColor: theme.cardSchemes.emerald.background, border: `1px solid ${theme.cardSchemes.emerald.border}`, borderRadius: theme.rounded.xl }}>
            <CardContent style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.emerald.titleText, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {labels.profitTitle}
                </span>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: theme.cardSchemes.emerald.badgeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUp size={20} color={theme.cardSchemes.emerald.accent} />
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: (summary?.monthly_net_profit || 0) >= 0 ? theme.cardSchemes.emerald.accent : theme.colors.error, marginBottom: "4px" }}>
                Rs. {summary?.monthly_net_profit?.toLocaleString() || "0"}
              </div>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.emerald.text }}>
                Includes dealer discounts & incentives
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Total Expenses (Rose Scheme) */}
          <Card style={{ backgroundColor: theme.cardSchemes.rose.background, border: `1px solid ${theme.cardSchemes.rose.border}`, borderRadius: theme.rounded.xl }}>
            <CardContent style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.rose.titleText, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {labels.expensesTitle}
                </span>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: theme.cardSchemes.rose.badgeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CreditCard size={20} color={theme.cardSchemes.rose.accent} />
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: theme.cardSchemes.rose.titleText, marginBottom: "4px" }}>
                Rs. {summary?.monthly_expenses?.toLocaleString() || "0"}
              </div>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.rose.text }}>
                Stock: Rs. {summary?.stock_expenses?.toLocaleString() || "0"} | Ops: Rs. {summary?.operational_expenses?.toLocaleString() || "0"}
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Inventory Alert Status (Purple Scheme) */}
          <Card style={{ backgroundColor: theme.cardSchemes.purple.background, border: `1px solid ${theme.cardSchemes.purple.border}`, borderRadius: theme.rounded.xl }}>
            <CardContent style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.purple.titleText, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Active Inventory
                </span>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: theme.cardSchemes.purple.badgeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Boxes size={20} color={theme.cardSchemes.purple.accent} />
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: theme.cardSchemes.purple.titleText, marginBottom: "4px" }}>
                {summary?.total_products_count || 0} Models
              </div>
              <div style={{ fontSize: "12px", color: (summary?.low_stock_count || 0) > 0 ? theme.colors.error : theme.cardSchemes.purple.text, fontWeight: (summary?.low_stock_count || 0) > 0 ? 600 : 400, display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertTriangle size={14} color={(summary?.low_stock_count || 0) > 0 ? theme.colors.error : theme.cardSchemes.purple.accent} />
                <span>{(summary?.low_stock_count || 0) + (summary?.out_of_stock_count || 0)} items require restocking</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "28px" }}>
          {/* LEFT COLUMN: LOW STOCK WARNING TABLE (Amber Scheme) WITH VERTICAL & HORIZONTAL SCROLLING */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <Card style={{ backgroundColor: theme.cardSchemes.amber.background, borderRadius: theme.rounded.xl, border: `1px solid ${theme.cardSchemes.amber.border}`, overflow: "hidden" }}>
              <CardHeader style={{ padding: "18px 24px", borderBottom: `1px solid ${theme.cardSchemes.amber.headerBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                  <AlertTriangle size={22} color="#d97706" style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <CardTitle style={{ fontSize: "17px", margin: 0 }}>Low Stock & Inventory Warnings</CardTitle>
                    <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: theme.colors.onSurfaceVariant }}>
                      Products with {lowStockThreshold} or fewer unit{lowStockThreshold > 1 ? "s" : ""} remaining in stock.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push("/stock-control/add")}
                  leftIcon={<Plus size={15} />}
                  style={{ flexShrink: 0 }}
                >
                  Restock Inventory
                </Button>
              </CardHeader>

              <CardContent style={{ padding: 0, width: "100%", overflowX: "auto" }}>
                {lowStockList.length === 0 ? (
                  <div style={{ padding: "36px", textAlign: "center", color: theme.colors.onSurfaceVariant }}>
                    <CheckCircle size={32} color={theme.colors.success} style={{ margin: "0 auto 10px" }} />
                    <div style={{ fontSize: "15px", fontWeight: 600, color: theme.colors.onSurface }}>Inventory Healthy</div>
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>All product models have adequate stock levels.</div>
                  </div>
                ) : (
                  /* Low Stock Table with Horizontal & Vertical Scrolling + Sticky Header */
                  <Table maxHeight="340px" style={{ minWidth: "540px" }} containerStyle={{ border: "none", borderRadius: 0, width: "100%", overflowX: "auto" }}>
                    <TableHeader style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      <TableRow style={{ backgroundColor: "#ffffff" }}>
                        <TableHead sticky style={{ paddingLeft: "24px" }}>Product Model</TableHead>
                        <TableHead sticky>Category</TableHead>
                        <TableHead sticky align="center">Stock Level</TableHead>
                        <TableHead sticky align="right">Retail Price</TableHead>
                        <TableHead sticky align="center" style={{ paddingRight: "24px" }}>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockList.map((item) => {
                        const isOut = item.quantity <= 0;
                        return (
                          <TableRow key={item.id}>
                            <TableCell style={{ paddingLeft: "24px", fontWeight: 600, color: theme.colors.onSurface }}>
                              {item.model}
                              {item.color && (
                                <span style={{ fontSize: "11px", color: theme.colors.onSurfaceVariant, display: "block" }}>
                                  Color: {item.color}
                                </span>
                              )}
                            </TableCell>

                            <TableCell>{item.category || "E-Bike"}</TableCell>

                            <TableCell align="center">
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 10px",
                                  borderRadius: "12px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  backgroundColor: isOut ? "#fee2e2" : "#fef3c7",
                                  color: isOut ? "#dc2626" : "#b45309",
                                }}
                              >
                                {isOut ? "OUT OF STOCK (0)" : `LOW STOCK (${item.quantity})`}
                              </span>
                            </TableCell>

                            <TableCell isNumeric style={{ fontWeight: 600 }}>
                              Rs. {item.retail_price?.toLocaleString()}
                            </TableCell>

                            <TableCell align="center" style={{ paddingRight: "24px" }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/stock-control/add")}
                                rightIcon={<ArrowRight size={13} />}
                              >
                                Restock
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: ONE-CLICK NATIVE DESKTOP REPORT GENERATOR (Blue Scheme) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <Card style={{ backgroundColor: theme.cardSchemes.blue.background, borderRadius: theme.rounded.xl, border: `1px solid ${theme.cardSchemes.blue.border}` }}>
              <CardHeader style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${theme.cardSchemes.blue.headerBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileSpreadsheet size={20} color={theme.colors.primary} />
                  <div>
                    <CardTitle style={{ fontSize: "17px", margin: 0 }}>One-Click Monthly Reports</CardTitle>

                  </div>
                </div>
              </CardHeader>

              <CardContent style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* File Format Selector */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: theme.colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                    Export File Format
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setReportFormat("csv")}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: theme.rounded.md,
                        border: `1.5px solid ${reportFormat === "csv" ? theme.colors.primary : theme.colors.outlineVariant}`,
                        backgroundColor: reportFormat === "csv" ? theme.colors.surfaceContainerLow : "transparent",
                        color: reportFormat === "csv" ? theme.colors.primary : theme.colors.onSurface,
                        fontWeight: reportFormat === "csv" ? 700 : 500,
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <FileSpreadsheet size={15} />
                      <span>CSV (.csv)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportFormat("txt")}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: theme.rounded.md,
                        border: `1.5px solid ${reportFormat === "txt" ? theme.colors.primary : theme.colors.outlineVariant}`,
                        backgroundColor: reportFormat === "txt" ? theme.colors.surfaceContainerLow : "transparent",
                        color: reportFormat === "txt" ? theme.colors.primary : theme.colors.onSurface,
                        fontWeight: reportFormat === "txt" ? 700 : 500,
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Layers size={15} />
                      <span>Text (.txt)</span>
                    </button>
                  </div>
                </div>

                <div style={{ height: "1px", backgroundColor: theme.colors.disabledBorder, margin: "2px 0" }} />

                {/* Report 1: Monthly Sales & Revenue */}
                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "14px", borderRadius: theme.rounded.md }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: theme.colors.onSurface, marginBottom: "2px" }}>
                    Monthly Sales & Revenue Report
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ width: "100%" }}
                    onClick={() => handleExportNativeReport("sales")}
                    disabled={exportingReport === "sales"}
                    leftIcon={<Download size={14} />}
                  >
                    {exportingReport === "sales" ? "Opening File Save Window..." : "Save Sales Report "}
                  </Button>
                </div>

                {/* Report 2: Monthly Expenses */}
                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "14px", borderRadius: theme.rounded.md }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: theme.colors.onSurface, marginBottom: "2px" }}>
                    Monthly Expense Statement
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ width: "100%" }}
                    onClick={() => handleExportNativeReport("expenses")}
                    disabled={exportingReport === "expenses"}
                    leftIcon={<Download size={14} />}
                  >
                    {exportingReport === "expenses" ? "Opening File Save Window..." : "Save Expense Report "}
                  </Button>
                </div>

                {/* Report 3: Executive Financial Summary */}
                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "14px", borderRadius: theme.rounded.md }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: theme.colors.onSurface, marginBottom: "2px" }}>
                    Executive P&L Summary Report
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ width: "100%" }}
                    onClick={() => handleExportNativeReport("summary")}
                    disabled={exportingReport === "summary"}
                    leftIcon={<Download size={14} />}
                  >
                    {exportingReport === "summary" ? "Opening File Save Window..." : "Save Executive P&L "}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
