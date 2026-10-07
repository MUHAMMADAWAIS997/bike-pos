"use client";

import React from "react";
import { theme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { ExpenseRecord } from "@/app/expenses/page";

export interface DeleteExpenseModalProps {
  expense: ExpenseRecord | null;
  onClose: () => void;
  onConfirmDelete: () => void;
  formatCurrency: (val: number) => string;
}

export const DeleteExpenseModal: React.FC<DeleteExpenseModalProps> = ({
  expense,
  onClose,
  onConfirmDelete,
  formatCurrency,
}) => {
  if (!expense) return null;

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
          maxWidth: "420px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxSizing: "border-box",
          backgroundColor: theme.colors.surfaceContainerLowest,
          border: `1px solid ${theme.colors.outlineVariant}`,
          borderRadius: theme.rounded.lg,
          boxShadow: theme.elevation.level2.boxShadow,
          display: "flex",
          flexDirection: "column",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: theme.colors.errorContainer,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle size={22} color={theme.colors.error} />
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontFamily: theme.typography.headlineMd.fontFamily,
                fontWeight: 600,
                color: theme.colors.onSurface,
              }}
            >
              Delete Expense?
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p style={{ fontSize: "14px", color: theme.colors.onSurface, margin: "0 0 20px 0" }}>
          Are you sure you want to delete expense record <strong style={{ color: theme.colors.onSurface }}>"{expense.title}"</strong> ({formatCurrency(expense.amount)})?
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onConfirmDelete}
            style={{ backgroundColor: theme.colors.error, color: theme.colors.onError }}
          >
            Confirm Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
