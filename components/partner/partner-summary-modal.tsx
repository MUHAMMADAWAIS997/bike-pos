"use client";

import React, { useState, useEffect, useCallback } from "react";
import { theme } from "@/lib/theme";
import { Button, Card, CardContent } from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import {
  X,
  PieChart,
  DollarSign,
  TrendingUp,
  Receipt,
  Calendar,
  RefreshCw,
  Percent,
  Calculator,
  User,
  Phone,
} from "lucide-react";

export interface PartnerSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: {
    id: string;
    name: string;
    mobile: string;
    equity_share: number;
  } | null;
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

export const PartnerSummaryModal: React.FC<PartnerSummaryModalProps> = ({
  isOpen,
  onClose,
  partner,
}) => {
  const { notify } = useNotification();
  const initialDates = getCurrentMonthDates();

  const [dateFilterMode, setDateFilterMode] = useState<"current" | "all" | "custom">("current");
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<PartnerFinancialSummaryData | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!partner) return;
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
        partnerId: partner.id,
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
  }, [partner, dateFilterMode, startDate, endDate, initialDates.start, initialDates.end, notify]);

  useEffect(() => {
    if (isOpen && partner) {
      fetchSummary();
    }
  }, [isOpen, partner, fetchSummary]);

  if (!isOpen || !partner) return null;

  const formatCurrency = (val: number | undefined | null) => {
    const num = typeof val === "number" && !isNaN(val) ? val : 0;
    return `Rs. ${num.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const equityRatio = partner.equity_share > 0 ? (100 / partner.equity_share).toFixed(2) : "0";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: theme.colors.surfaceContainerLowest,
          borderRadius: theme.rounded.xl,
          border: `1px solid ${theme.colors.outlineVariant}`,
          width: "100%",
          maxWidth: "880px",
          maxHeight: "90vh",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${theme.colors.disabledBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.colors.surfaceContainerLow,
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <PieChart size={24} color={theme.colors.primary} />
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 700,
                  fontFamily: theme.typography.display.fontFamily,
                  color: theme.colors.onSurface,
                }}
              >
                {partner.name} &mdash; Partner Equity & Expense Summary
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px", fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Phone size={14} /> {partner.mobile}
              </span>
              <span
                style={{
                  backgroundColor: theme.colors.primaryContainer,
                  color: theme.colors.onPrimaryContainer,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                {partner.equity_share}% Equity Share (1/{equityRatio})
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme.colors.onSurfaceVariant,
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Date Filter Selection Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: theme.colors.surfaceContainerLow,
              padding: "12px 16px",
              borderRadius: theme.rounded.md,
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} color={theme.colors.primary} />
              <span style={{ fontSize: "14px", fontWeight: 600, color: theme.colors.onSurface }}>Filter Period:</span>

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
                    borderRadius: theme.rounded.DEFAULT,
                    border: `1px solid ${theme.colors.disabledBorder}`,
                    fontSize: "13px",
                  }}
                />
                <span style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant }}>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: theme.rounded.DEFAULT,
                    border: `1px solid ${theme.colors.disabledBorder}`,
                    fontSize: "13px",
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
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: theme.colors.onSurfaceVariant }}>
              <RefreshCw size={28} className="animate-spin" color={theme.colors.primary} style={{ margin: "0 auto 12px" }} />
              <p style={{ margin: 0, fontSize: "14px" }}>Calculating partner financial summary for {partner.name}...</p>
            </div>
          ) : summary ? (
            <>
              {/* Partner Financial Stat Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                {/* 1. Partner Total Expense Share (Rose Scheme) */}
                <Card style={{ backgroundColor: theme.cardSchemes.rose.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.rose.border}` }}>
                  <CardContent style={{ padding: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.rose.titleText }}>
                        Partner Expense Share
                      </span>
                      <div style={{ backgroundColor: theme.cardSchemes.rose.badgeBg, padding: "6px", borderRadius: "50%" }}>
                        <Receipt size={20} color={theme.cardSchemes.rose.accent} />
                      </div>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "22px", fontWeight: 800, color: theme.cardSchemes.rose.titleText }}>
                      {formatCurrency(summary.partner_total_expense_share)}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: theme.cardSchemes.rose.text }}>
                      {partner.equity_share}% of Store Expenses ({formatCurrency(summary.total_store_expenses)})
                    </p>
                  </CardContent>
                </Card>

                {/* 2. Partner Net Profit Share (Emerald Scheme) */}
                <Card style={{ backgroundColor: theme.cardSchemes.emerald.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.emerald.border}` }}>
                  <CardContent style={{ padding: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.emerald.titleText }}>
                        Partner Net Profit Share
                      </span>
                      <div style={{ backgroundColor: theme.cardSchemes.emerald.badgeBg, padding: "6px", borderRadius: "50%" }}>
                        <TrendingUp size={20} color={theme.cardSchemes.emerald.accent} />
                      </div>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "22px", fontWeight: 800, color: theme.cardSchemes.emerald.titleText }}>
                      {formatCurrency(summary.partner_net_profit_share)}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: theme.cardSchemes.emerald.text }}>
                      {partner.equity_share}% of Sold Products Profit ({formatCurrency(summary.store_net_profit)})
                    </p>
                  </CardContent>
                </Card>

                {/* 3. Partner Stock Intake Expense Share (Purple Scheme) */}
                <Card style={{ backgroundColor: theme.cardSchemes.purple.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.purple.border}` }}>
                  <CardContent style={{ padding: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.purple.titleText }}>
                        Stock Purchase Share
                      </span>
                      <div style={{ backgroundColor: theme.cardSchemes.purple.badgeBg, padding: "6px", borderRadius: "50%" }}>
                        <DollarSign size={20} color={theme.cardSchemes.purple.accent} />
                      </div>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "22px", fontWeight: 800, color: theme.cardSchemes.purple.titleText }}>
                      {formatCurrency(summary.partner_stock_expense_share)}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: theme.cardSchemes.purple.text }}>
                      {partner.equity_share}% of Stock Intake ({formatCurrency(summary.stock_expenses)})
                    </p>
                  </CardContent>
                </Card>

                {/* 4. Partner Operational Expense Share (Blue Scheme) */}
                <Card style={{ backgroundColor: theme.cardSchemes.blue.background, borderRadius: theme.rounded.lg, border: `1px solid ${theme.cardSchemes.blue.border}` }}>
                  <CardContent style={{ padding: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.blue.titleText }}>
                        Operational Expense Share
                      </span>
                      <div style={{ backgroundColor: theme.cardSchemes.blue.badgeBg, padding: "6px", borderRadius: "50%" }}>
                        <Percent size={20} color={theme.cardSchemes.blue.accent} />
                      </div>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "22px", fontWeight: 800, color: theme.cardSchemes.blue.titleText }}>
                      {formatCurrency(summary.partner_operational_expense_share)}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: theme.cardSchemes.blue.text }}>
                      {partner.equity_share}% of Utilities/Rent/Salaries ({formatCurrency(summary.operational_expenses)})
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Expense & Profit Division Breakdown Card */}
              <Card style={{ backgroundColor: theme.colors.surfaceContainerLow, borderRadius: theme.rounded.lg, border: `1px solid ${theme.colors.outlineVariant}` }}>
                <CardContent style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Calculator size={20} color={theme.colors.primary} />
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: theme.colors.onSurface }}>
                      Expense & Profit Division Breakdown ({partner.equity_share}% Equity Share)
                    </h3>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                    {/* Store Expenses Summary */}
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        padding: "16px",
                        borderRadius: theme.rounded.md,
                        border: `1px solid ${theme.colors.disabledBorder}`,
                        fontSize: "13px",
                      }}
                    >
                      <p style={{ margin: "0 0 12px 0", fontWeight: 700, color: theme.colors.onSurface, borderBottom: `1px solid ${theme.colors.disabledBorder}`, paddingBottom: "6px" }}>
                        Store Expenses (Reference: Expenses Page)
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ color: theme.colors.onSurfaceVariant }}>Stock Purchase Intakes:</span>
                        <strong style={{ color: theme.colors.primary }}>{formatCurrency(summary.stock_expenses)}</strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ color: theme.colors.onSurfaceVariant }}>Operational Costs (Rent/Salaries):</span>
                        <strong style={{ color: theme.colors.secondary }}>{formatCurrency(summary.operational_expenses)}</strong>
                      </div>

                      <div style={{ borderTop: `1px dashed ${theme.colors.disabledBorder}`, paddingTop: "8px", marginTop: "6px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700, color: theme.colors.onSurface }}>Total Store Expenses:</span>
                        <strong style={{ fontWeight: 800, color: theme.colors.error }}>{formatCurrency(summary.total_store_expenses)}</strong>
                      </div>
                    </div>

                    {/* Partner Share Breakdown */}
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        padding: "16px",
                        borderRadius: theme.rounded.md,
                        border: `1px solid ${theme.colors.disabledBorder}`,
                        fontSize: "13px",
                      }}
                    >
                      <p style={{ margin: "0 0 12px 0", fontWeight: 700, color: theme.colors.onSurface, borderBottom: `1px solid ${theme.colors.disabledBorder}`, paddingBottom: "6px" }}>
                        {partner.name}&apos;s Expense Obligations ({partner.equity_share}%)
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ color: theme.colors.onSurfaceVariant }}>Stock Purchase Share ({partner.equity_share}%):</span>
                        <strong style={{ color: theme.colors.primary }}>{formatCurrency(summary.partner_stock_expense_share)}</strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ color: theme.colors.onSurfaceVariant }}>Operational Expense Share ({partner.equity_share}%):</span>
                        <strong style={{ color: theme.colors.secondary }}>{formatCurrency(summary.partner_operational_expense_share)}</strong>
                      </div>

                      <div style={{ borderTop: `1px dashed ${theme.colors.disabledBorder}`, paddingTop: "8px", marginTop: "6px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700, color: theme.colors.onSurface }}>Partner Total Expense Share:</span>
                        <strong style={{ fontWeight: 800, color: theme.colors.error }}>{formatCurrency(summary.partner_total_expense_share)}</strong>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

       
      </div>
    </div>
  );
};
