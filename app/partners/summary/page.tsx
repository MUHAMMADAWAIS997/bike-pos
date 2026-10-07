"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import {
  Button,
  Card,
  CardContent,
} from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import {
  ArrowLeft,
  PieChart,
  Calendar,
  RefreshCw,
  Receipt,
  TrendingUp,
  DollarSign,
  Percent,
  Calculator,
} from "lucide-react";

export interface PartnerData {
  id: string;
  name: string;
  mobile: string;
  equity_share: number;
  color_key: string;
  created_at: string;
}

export interface PartnerFinancialSummaryData {
  partner_id: string;
  partner_name: string;
  equity_share: number;
  total_store_revenue: number;
  total_initial_profit: number;
  total_incentives: number;
  gross_product_profit: number;
  total_store_expenses: number;
  stock_expenses: number;
  operational_expenses: number;
  store_net_profit: number;
  partner_revenue_share: number;
  partner_initial_profit_share: number;
  partner_incentive_share: number;
  partner_gross_profit_share: number;
  partner_total_expense_share: number;
  partner_stock_expense_share: number;
  partner_operational_expense_share: number;
  partner_net_profit_share: number;
  total_units_sold: number;
  total_sales_count: number;
  total_expenses_count: number;
}

const getCurrentMonthDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const firstDay = `${year}-${month}-01`;
  const lastDay = `${year}-${month}-${String(now.getDate()).padStart(2, "0")}`;
  return { start: firstDay, end: lastDay };
};

function PartnerSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerId = searchParams.get("id");
  const { notify } = useNotification();

  const initialDates = getCurrentMonthDates();

  const [dateFilterMode, setDateFilterMode] = useState<"current" | "all" | "custom">("current");
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PartnerFinancialSummaryData | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!partnerId) return;
    setLoading(true);

    try {
      const { invoke } = await import("@tauri-apps/api/core");

      let startParam: string | null = null;
      let endParam: string | null = null;

      if (dateFilterMode === "current") {
        startParam = initialDates.start;
        endParam = initialDates.end;
      } else if (dateFilterMode === "custom") {
        startParam = startDate;
        endParam = endDate;
      }

      const res: PartnerFinancialSummaryData = await invoke("get_partner_financial_summary", {
        partnerId,
        startDate: startParam,
        endDate: endParam,
      });

      setSummary(res);
    } catch (err: any) {
      console.error("Failed to fetch partner summary", err);
      notify("Failed to load partner financial summary.", "error");
    } finally {
      setLoading(false);
    }
  }, [partnerId, dateFilterMode, startDate, endDate, initialDates.start, initialDates.end, notify]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const formatCurrency = (val: number | undefined | null) => {
    const num = typeof val === "number" && !isNaN(val) ? val : 0;
    return `Rs. ${num.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const equityShare = summary?.equity_share ?? 0;
  const equityRatio = equityShare > 0 ? (100 / equityShare).toFixed(2) : "0";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>
        {/* Top Header Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <Button
            variant="outline"
            onClick={() => router.push("/partners")}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Partners
          </Button>

          {summary && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  backgroundColor: theme.colors.primaryContainer,
                  color: theme.colors.onPrimaryContainer,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: "16px",
                  fontSize: "13px",
                }}
              >
                {equityShare}% Equity Share (1/{equityRatio})
              </span>
            </div>
          )}
        </div>

        {/* Header Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <PieChart size={28} color={theme.colors.primary} />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 700,
                fontFamily: theme.typography.display.fontFamily,
                color: theme.colors.onSurface,
              }}
            >
              {summary ? summary.partner_name : "Partner"} &mdash; Equity Profit & Expense Summary
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: theme.colors.onSurfaceVariant }}>
              Full financial statement and equity dividend distribution breakdown
            </p>
          </div>
        </div>

        {/* Date Filter Selection Bar (Slate Scheme) */}
        <Card style={{ backgroundColor: theme.cardSchemes.slate.background, border: `1px solid ${theme.cardSchemes.slate.border}`, borderRadius: theme.rounded.md }}>
          <CardContent style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} color={theme.cardSchemes.slate.accent} />
              <span style={{ fontSize: "14px", fontWeight: 700, color: theme.cardSchemes.slate.titleText }}>Filter Period:</span>

              <div style={{ display: "flex", gap: "6px" }}>
                <Button
                  size="sm"
                  variant={dateFilterMode === "current" ? "primary" : "outline"}
                  onClick={() => setDateFilterMode("current")}
                >
                  Current Month
                </Button>
                <Button
                  size="sm"
                  variant={dateFilterMode === "all" ? "primary" : "outline"}
                  onClick={() => setDateFilterMode("all")}
                >
                  All Time
                </Button>
                <Button
                  size="sm"
                  variant={dateFilterMode === "custom" ? "primary" : "outline"}
                  onClick={() => setDateFilterMode("custom")}
                >
                  Custom Range
                </Button>
              </div>
            </div>

            {dateFilterMode === "custom" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: theme.rounded.md,
                    border: "1px solid #7dd3fc",
                    backgroundColor: "#f0f9ff",
                    fontSize: "13px",
                    color: "#0c4a6e",
                    fontWeight: 600,
                  }}
                />
                <span style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant }}>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: theme.rounded.md,
                    border: "1px solid #7dd3fc",
                    backgroundColor: "#f0f9ff",
                    fontSize: "13px",
                    color: "#0c4a6e",
                    fontWeight: 600,
                  }}
                />
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={fetchSummary}
              leftIcon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
            >
              Recalculate
            </Button>
          </CardContent>
        </Card>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: theme.colors.onSurfaceVariant }}>
            <RefreshCw size={32} className="animate-spin" color={theme.colors.primary} style={{ margin: "0 auto 16px" }} />
            <p style={{ margin: 0, fontSize: "16px" }}>Calculating financial summary statement...</p>
          </div>
        ) : summary ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Stat Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
              {/* 1. Partner Total Expense Share (Rose Scheme) */}
              <Card style={{ backgroundColor: theme.cardSchemes.rose.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.rose.border}` }}>
                <CardContent style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: theme.cardSchemes.rose.titleText }}>
                      Partner Expense Share
                    </span>
                    <div style={{ backgroundColor: theme.cardSchemes.rose.badgeBg, padding: "8px", borderRadius: "50%" }}>
                      <Receipt size={22} color={theme.cardSchemes.rose.accent} />
                    </div>
                  </div>
                  <p style={{ margin: "0 0 6px 0", fontSize: "26px", fontWeight: 800, color: theme.cardSchemes.rose.titleText }}>
                    {formatCurrency(summary.partner_total_expense_share)}
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: theme.cardSchemes.rose.text }}>
                    {equityShare}% of Store Expenses ({formatCurrency(summary.total_store_expenses)})
                  </p>
                </CardContent>
              </Card>

              {/* 2. Partner Net Profit Share (Emerald Scheme) */}
              <Card style={{ backgroundColor: theme.cardSchemes.emerald.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.emerald.border}` }}>
                <CardContent style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: theme.cardSchemes.emerald.titleText }}>
                      Partner Net Profit Share
                    </span>
                    <div style={{ backgroundColor: theme.cardSchemes.emerald.badgeBg, padding: "8px", borderRadius: "50%" }}>
                      <TrendingUp size={22} color={theme.cardSchemes.emerald.accent} />
                    </div>
                  </div>
                  <p style={{ margin: "0 0 6px 0", fontSize: "26px", fontWeight: 800, color: theme.cardSchemes.emerald.titleText }}>
                    {formatCurrency(summary.partner_net_profit_share)}
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: theme.cardSchemes.emerald.text }}>
                    {equityShare}% of Sold Products Profit ({formatCurrency(summary.store_net_profit)})
                  </p>
                </CardContent>
              </Card>

              {/* 3. Partner Stock Intake Expense Share (Purple Scheme) */}
              <Card style={{ backgroundColor: theme.cardSchemes.purple.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.purple.border}` }}>
                <CardContent style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: theme.cardSchemes.purple.titleText }}>
                      Stock Purchase Share
                    </span>
                    <div style={{ backgroundColor: theme.cardSchemes.purple.badgeBg, padding: "8px", borderRadius: "50%" }}>
                      <DollarSign size={22} color={theme.cardSchemes.purple.accent} />
                    </div>
                  </div>
                  <p style={{ margin: "0 0 6px 0", fontSize: "26px", fontWeight: 800, color: theme.cardSchemes.purple.titleText }}>
                    {formatCurrency(summary.partner_stock_expense_share)}
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: theme.cardSchemes.purple.text }}>
                    {equityShare}% of Stock Intake ({formatCurrency(summary.stock_expenses)})
                  </p>
                </CardContent>
              </Card>

              {/* 4. Partner Operational Expense Share (Blue Scheme) */}
              <Card style={{ backgroundColor: theme.cardSchemes.blue.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.blue.border}` }}>
                <CardContent style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: theme.cardSchemes.blue.titleText }}>
                      Operational Expense Share
                    </span>
                    <div style={{ backgroundColor: theme.cardSchemes.blue.badgeBg, padding: "8px", borderRadius: "50%" }}>
                      <Percent size={22} color={theme.cardSchemes.blue.accent} />
                    </div>
                  </div>
                  <p style={{ margin: "0 0 6px 0", fontSize: "26px", fontWeight: 800, color: theme.cardSchemes.blue.titleText }}>
                    {formatCurrency(summary.partner_operational_expense_share)}
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: theme.cardSchemes.blue.text }}>
                    {equityShare}% of Utilities/Rent/Salaries ({formatCurrency(summary.operational_expenses)})
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Expense & Profit Division Breakdown Card (Slate Scheme) */}
            <Card style={{ backgroundColor: theme.cardSchemes.slate.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.slate.border}` }}>
              <CardContent style={{ padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <Calculator size={22} color={theme.colors.primary} />
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: theme.colors.onSurface }}>
                    Expense & Profit Division Breakdown ({equityShare}% Equity Share)
                  </h3>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  {/* Store Expenses Summary */}
                  <div
                    style={{
                      backgroundColor: theme.colors.surfaceContainerLow,
                      padding: "20px",
                      borderRadius: theme.rounded.md,
                      border: `1px solid ${theme.colors.disabledBorder}`,
                      fontSize: "14px",
                    }}
                  >
                    <p style={{ margin: "0 0 16px 0", fontWeight: 700, fontSize: "15px", color: theme.colors.onSurface, borderBottom: `1px solid ${theme.colors.disabledBorder}`, paddingBottom: "8px" }}>
                      Store Expenses (Reference: Expenses Page)
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ color: theme.colors.onSurfaceVariant }}>Stock Purchase Intakes:</span>
                      <strong style={{ color: theme.colors.primary }}>{formatCurrency(summary.stock_expenses)}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ color: theme.colors.onSurfaceVariant }}>Operational Costs (Rent/Salaries):</span>
                      <strong style={{ color: theme.colors.secondary }}>{formatCurrency(summary.operational_expenses)}</strong>
                    </div>

                    <div style={{ borderTop: `1px dashed ${theme.colors.disabledBorder}`, paddingTop: "12px", marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, color: theme.colors.onSurface }}>Total Store Expenses:</span>
                      <strong style={{ fontWeight: 800, fontSize: "16px", color: theme.colors.error }}>{formatCurrency(summary.total_store_expenses)}</strong>
                    </div>
                  </div>

                  {/* Partner Share Breakdown */}
                  <div
                    style={{
                      backgroundColor: theme.colors.surfaceContainerLow,
                      padding: "20px",
                      borderRadius: theme.rounded.md,
                      border: `1px solid ${theme.colors.disabledBorder}`,
                      fontSize: "14px",
                    }}
                  >
                    <p style={{ margin: "0 0 16px 0", fontWeight: 700, fontSize: "15px", color: theme.colors.onSurface, borderBottom: `1px solid ${theme.colors.disabledBorder}`, paddingBottom: "8px" }}>
                      {summary ? summary.partner_name : "Partner"}&apos;s Expense Obligations ({equityShare}%)
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ color: theme.colors.onSurfaceVariant }}>Stock Purchase Share ({equityShare}%):</span>
                      <strong style={{ color: theme.colors.primary }}>{formatCurrency(summary.partner_stock_expense_share)}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ color: theme.colors.onSurfaceVariant }}>Operational Expense Share ({equityShare}%):</span>
                      <strong style={{ color: theme.colors.secondary }}>{formatCurrency(summary.partner_operational_expense_share)}</strong>
                    </div>

                    <div style={{ borderTop: `1px dashed ${theme.colors.disabledBorder}`, paddingTop: "12px", marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, color: theme.colors.onSurface }}>Partner Total Expense Share:</span>
                      <strong style={{ fontWeight: 800, fontSize: "16px", color: theme.colors.error }}>{formatCurrency(summary.partner_total_expense_share)}</strong>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function PartnerSummaryPage() {
  return (
    <Suspense fallback={<div style={{ padding: "30px" }}>Loading Partner Summary...</div>}>
      <PartnerSummaryContent />
    </Suspense>
  );
}
