"use client";

import React, { useState, useEffect } from "react";
import { theme } from "@/lib/theme";
import { Button, Input } from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import { X, Award, CheckCircle2, Calendar, DollarSign, FileText } from "lucide-react";

export interface RevenueSummaryItemRow {
  product_id: string;
  product_model: string;
  payment_type: string;
  installment_months: number;
  installment_number?: number;
  retail_price: number;
  sold_price?: number;
  discount_amount?: number;
  cost_price: number;
  quantity_sold: number;
  total_sales: number;
  recognized_cost: number;
  fee_profit: number;
  initial_profit: number;
  incentive_percentage: number;
  incentive_amount: number;
  total_profit: number;
  has_incentive: boolean;
}

export interface AddIncentiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMonthYear: string;
  onIncentiveSaved: () => void;
  baseMonthProfit?: number;
}

export const AddIncentiveModal: React.FC<AddIncentiveModalProps> = ({
  isOpen,
  onClose,
  defaultMonthYear,
  onIncentiveSaved,
  baseMonthProfit = 0,
}) => {
  const { notify } = useNotification();
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(defaultMonthYear || "");
  const [amountInput, setAmountInput] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(false);

  useEffect(() => {
    if (defaultMonthYear) {
      setSelectedMonthYear(defaultMonthYear);
    }
  }, [defaultMonthYear, isOpen]);

  // Load existing incentive record when month selection changes or modal opens
  useEffect(() => {
    if (!isOpen || !selectedMonthYear) return;

    let isMounted = true;
    async function loadExistingIncentive() {
      setFetchingExisting(true);
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const res: any = await invoke("get_monthly_incentive", { monthYear: selectedMonthYear });
        if (isMounted && res) {
          setAmountInput(res.incentive_amount > 0 ? res.incentive_amount.toString() : "");
          setDescription(res.description || "");
        }
      } catch (err) {
        console.error("Failed to load monthly incentive:", err);
      } finally {
        if (isMounted) setFetchingExisting(false);
      }
    }

    loadExistingIncentive();
    return () => {
      isMounted = false;
    };
  }, [selectedMonthYear, isOpen]);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amountInput) || 0;
  const updatedTotalNetProfit = baseMonthProfit + parsedAmount;

  const formatCurrency = (val: number) => {
    return `Rs. ${val.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMonthYear || selectedMonthYear.trim() === "") {
      setError("Please select a valid Month and Year.");
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Please enter a valid non-negative incentive amount.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("save_monthly_incentive", {
        monthYear: selectedMonthYear.trim(),
        amount: parsedAmount,
        description: description.trim() || null,
      });

      notify(
        `One-time monthly incentive of ${formatCurrency(parsedAmount)} saved for ${selectedMonthYear}.`,
        "success"
      );
      onIncentiveSaved();
      onClose();
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to save incentive.";
      setError(msg);
      notify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

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
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: theme.colors.surfaceContainerLowest,
          borderRadius: theme.rounded.xl,
          border: `1px solid ${theme.colors.outlineVariant}`,
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Award size={22} color={theme.colors.primary} />
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                  fontFamily: theme.typography.display.fontFamily,
                  color: theme.colors.onSurface,
                }}
              >
                Add Monthly Incentive
              </h2>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: theme.colors.onSurfaceVariant }}>
                Record a one-time lump sum profit bonus for the selected month/year
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              color: theme.colors.onSurfaceVariant,
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
          {/* Month & Year Selection */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: theme.typography.labelMd.fontFamily,
                color: theme.colors.onSurface,
                letterSpacing: "0.04em",
              }}
            >
              SELECT MONTH & YEAR
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#f0f9ff",
                border: `1.5px solid ${theme.cardSchemes.blue.border}`,
                borderRadius: theme.rounded.md,
                padding: "8px 12px",
              }}
            >
              <Calendar size={18} color={theme.colors.primary} />
              <input
                type="month"
                value={selectedMonthYear}
                onChange={(e) => {
                  setSelectedMonthYear(e.target.value);
                  setError("");
                }}
                disabled={loading || fetchingExisting}
                style={{
                  flex: 1,
                  border: "none",
                  backgroundColor: "transparent",
                  color: theme.cardSchemes.blue.titleText,
                  fontWeight: 700,
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: theme.typography.bodyMd.fontFamily,
                  cursor: "pointer",
                }}
              />
            </div>
          </div>

          {/* Incentive Amount Input */}
          <div>
            <Input
              label="ONE-TIME INCENTIVE AMOUNT (RS.)"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 50000"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value);
                setError("");
              }}
              leftIcon={<DollarSign size={16} color={theme.colors.primary} />}
              error={error}
              disabled={loading || fetchingExisting}
            />
          </div>

          {/* Note / Description */}
          <div>
            <Input
              label="INCENTIVE DESCRIPTION / REMARKS (OPTIONAL)"
              type="text"
              placeholder="e.g. Company sales milestone bonus"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              leftIcon={<FileText size={16} color={theme.colors.outline} />}
              disabled={loading || fetchingExisting}
            />
          </div>

          {/* Live Profit Calculation Preview Box */}
          <div
            style={{
              backgroundColor: theme.cardSchemes.emerald.background,
              border: `1px solid ${theme.cardSchemes.emerald.border}`,
              padding: "16px",
              borderRadius: theme.rounded.md,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: theme.cardSchemes.emerald.text }}>Base Gross Profit ({selectedMonthYear || "Month"}):</span>
              <strong style={{ color: theme.cardSchemes.emerald.titleText }}>{formatCurrency(baseMonthProfit)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: theme.cardSchemes.emerald.text }}>+ One-Time Incentive Added:</span>
              <strong style={{ color: theme.colors.success, fontSize: "14px" }}>+ {formatCurrency(parsedAmount)}</strong>
            </div>

            <div
              style={{
                borderTop: `1px solid ${theme.cardSchemes.emerald.headerBorder}`,
                paddingTop: "8px",
                marginTop: "4px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
              }}
            >
              <span style={{ fontWeight: 700, color: theme.cardSchemes.emerald.titleText }}>Updated Net Store Profit:</span>
              <strong style={{ fontWeight: 800, fontSize: "16px", color: theme.cardSchemes.emerald.titleText }}>
                {formatCurrency(updatedTotalNetProfit)}
              </strong>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={loading || fetchingExisting}
              leftIcon={<CheckCircle2 size={16} />}
            >
              {loading ? "Saving..." : "Save Incentive"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
