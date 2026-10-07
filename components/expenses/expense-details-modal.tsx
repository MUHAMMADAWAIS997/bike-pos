"use client";

import React from "react";
import { theme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { X, FileText } from "lucide-react";
import { ExpenseRecord } from "@/app/expenses/page";

export interface ExpenseDetailsModalProps {
  expense: ExpenseRecord | null;
  onClose: () => void;
  formatCurrency: (val: number) => string;
  getCategoryBadgeStyle: (category: string) => { bg: string; color: string; border: string };
}

export const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({
  expense,
  onClose,
  formatCurrency,
  getCategoryBadgeStyle,
}) => {
  if (!expense) return null;

  const badgeStyle = getCategoryBadgeStyle(expense.category);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(11, 28, 48, 0.4)",
        backdropFilter: "blur(2px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          backgroundColor: theme.colors.surfaceContainerLowest,
          border: `1px solid ${theme.colors.outlineVariant}`,
          borderRadius: theme.rounded.lg,
          boxShadow: theme.elevation.level2.boxShadow,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: `1px solid ${theme.colors.disabledBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.colors.surfaceContainerLow,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileText size={20} color={theme.colors.primary} />
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontFamily: theme.typography.headlineMd.fontFamily,
                  fontWeight: 600,
                  color: theme.colors.onSurface,
                }}
              >
                Expense Details
              </h2>
              <p style={{ margin: 0, fontSize: "11px", color: theme.colors.onSurfaceVariant, fontFamily: "monospace" }}>
                ID: {expense.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme.colors.onSurfaceVariant,
              padding: "4px",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
          {/* Amount Box */}
          <div
            style={{
              backgroundColor: theme.colors.errorContainer,
              borderRadius: theme.rounded.DEFAULT,
              padding: "16px",
              textAlign: "center",
              border: "1px solid rgba(186, 26, 26, 0.2)",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.onErrorContainer, letterSpacing: "0.05em" }}>
              AMOUNT EXPENSED
            </span>
            <p style={{ margin: "4px 0 0 0", fontSize: "28px", fontWeight: 800, color: theme.colors.error }}>
              {formatCurrency(expense.amount)}
            </p>
          </div>

          <div>
            <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.onSurfaceVariant }}>
              TITLE / PARTICULAR
            </span>
            <p style={{ margin: "4px 0 0 0", fontSize: "15px", fontWeight: 600, color: theme.colors.onSurface }}>
              {expense.title}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.onSurfaceVariant }}>
                CATEGORY
              </span>
              <div style={{ marginTop: "4px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    backgroundColor: badgeStyle.bg,
                    color: badgeStyle.color,
                    border: `1px solid ${badgeStyle.border}`,
                  }}
                >
                  {expense.category}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.onSurfaceVariant }}>
                PAYMENT METHOD
              </span>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", fontWeight: 500, color: theme.colors.onSurface }}>
                {expense.payment_method}
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.onSurfaceVariant }}>
                DATE & TIME
              </span>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: theme.colors.onSurface }}>
                {expense.created_at}
              </p>
            </div>

            <div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.onSurfaceVariant }}>
                REFERENCE ID
              </span>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", fontFamily: "monospace", color: theme.colors.onSurface }}>
                {expense.reference_id || "N/A"}
              </p>
            </div>
          </div>

          {expense.description && (
            <div
              style={{
                backgroundColor: theme.colors.surfaceContainerLow,
                padding: "12px",
                borderRadius: theme.rounded.DEFAULT,
                border: `1px solid ${theme.colors.disabledBorder}`,
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.onSurfaceVariant }}>
                NOTES & DESCRIPTION
              </span>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: theme.colors.onSurface, whiteSpace: "pre-wrap" }}>
                {expense.description}
              </p>
            </div>
          )}

          {/* Action */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "8px",
              paddingTop: "16px",
              borderTop: `1px solid ${theme.colors.disabledBorder}`,
            }}
          >
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
