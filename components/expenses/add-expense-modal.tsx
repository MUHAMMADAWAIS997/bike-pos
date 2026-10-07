"use client";

import React, { useState } from "react";
import { theme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNotification } from "@/components/ui/notification";
import { expenseCategories, expenseSchema, ExpenseInput } from "@/lib/validations/expense";
import { X, Plus, Receipt } from "lucide-react";

export interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseAdded,
}) => {
  const { notify } = useNotification();

  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    customCategory: string;
    amount: string;
    paymentMethod: string;
    description: string;
  }>({
    title: "",
    category: "Utilities",
    customCategory: "",
    amount: "",
    paymentMethod: "Cash",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setServerError(null);
  };

  const validate = (): boolean => {
    setErrors({});
    setServerError(null);

    const activeCat =
      formData.category === "Other Custom..."
        ? formData.customCategory.trim()
        : formData.category;

    const numericAmount = parseFloat(formData.amount);

    const result = expenseSchema.safeParse({
      title: formData.title.trim(),
      category: activeCat,
      amount: isNaN(numericAmount) ? 0 : numericAmount,
      paymentMethod: formData.paymentMethod,
      description: formData.description.trim(),
    });

    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          errMap[err.path[0].toString()] = err.message;
        }
      });
      setErrors(errMap);
      notify("Please fix validation errors in the form.", "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const activeCat =
      formData.category === "Other Custom..."
        ? formData.customCategory.trim()
        : formData.category;
    const numericAmount = parseFloat(formData.amount);

    try {
      if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("add_expense", {
          title: formData.title.trim(),
          category: activeCat,
          amount: numericAmount,
          paymentMethod: formData.paymentMethod,
          description: formData.description.trim() || null,
        });
      } else {
        await new Promise((res) => setTimeout(res, 500));
      }

      notify(`Expense "${formData.title.trim()}" recorded successfully!`, "success");
      setFormData({
        title: "",
        category: "Utilities",
        customCategory: "",
        amount: "",
        paymentMethod: "Cash",
        description: "",
      });
      onExpenseAdded();
      onClose();
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to record expense.";
      setServerError(msg);
      notify(msg, "error", "Recording Failed");
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
          maxWidth: "520px",
          maxHeight: "90vh",
          backgroundColor: theme.cardSchemes.slate.background,
          border: `1px solid ${theme.cardSchemes.slate.border}`,
          borderRadius: theme.rounded.lg,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
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
            borderBottom: `1px solid ${theme.cardSchemes.slate.headerBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.cardSchemes.slate.badgeBg,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Receipt size={20} color={theme.cardSchemes.slate.accent} />
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontFamily: theme.typography.headlineMd.fontFamily,
                fontWeight: 700,
                color: theme.cardSchemes.slate.titleText,
              }}
            >
              Record New Expense
            </h2>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
          {serverError && (
            <div
              style={{
                backgroundColor: theme.colors.errorContainer,
                color: theme.colors.onErrorContainer,
                border: "1px solid rgba(186, 26, 26, 0.25)",
                borderRadius: theme.rounded.DEFAULT,
                padding: "10px 14px",
                fontSize: "13px",
              }}
            >
              {serverError}
            </div>
          )}

          <Input
            label="EXPENSE TITLE / PARTICULARS"
            placeholder="e.g. LESCO Electricity Bill August"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            error={errors.title}
            disabled={loading}
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: theme.typography.labelMd.fontFamily,
                  fontSize: theme.typography.labelMd.fontSize,
                  fontWeight: 600,
                  color: theme.colors.onSurface,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "4px",
                }}
              >
                CATEGORY
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: theme.colors.onSurface,
                  backgroundColor: "#ffffff",
                  border: `1.5px solid ${errors.category ? theme.colors.error : "#cbd5e1"}`,
                  borderRadius: theme.rounded.DEFAULT,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                {expenseCategories
                  .filter((c) => c !== "Stock Purchase")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                <option value="Other Custom...">Other Custom...</option>
              </select>
              {errors.category && (
                <span style={{ fontSize: "12px", color: theme.colors.error, marginTop: "2px", display: "block" }}>
                  {errors.category}
                </span>
              )}
            </div>

            <Input
              label="AMOUNT (PKR)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              error={errors.amount}
              disabled={loading}
            />
          </div>

          {formData.category === "Other Custom..." && (
            <Input
              label="CUSTOM CATEGORY NAME"
              placeholder="Enter category name"
              value={formData.customCategory}
              onChange={(e) => handleChange("customCategory", e.target.value)}
              error={errors.category}
              disabled={loading}
            />
          )}

          <div>
            <label
              style={{
                display: "block",
                fontFamily: theme.typography.labelMd.fontFamily,
                fontSize: theme.typography.labelMd.fontSize,
                fontWeight: 600,
                color: theme.colors.onSurface,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "4px",
              }}
            >
              PAYMENT METHOD
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handleChange("paymentMethod", e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                color: theme.colors.onSurface,
                backgroundColor: "#ffffff",
                border: "1.5px solid #cbd5e1",
                borderRadius: theme.rounded.DEFAULT,
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Cheque">Cheque</option>
              <option value="Online">Online Wallet / Easypaisa / JazzCash</option>
            </select>
          </div>

          <Textarea
            label="DESCRIPTION & NOTES (OPTIONAL)"
            placeholder="Invoice number, vendor details, or extra notes..."
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            error={errors.description}
            disabled={loading}
          />

          {/* Modal Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "8px",
              paddingTop: "16px",
              borderTop: `1px solid ${theme.colors.disabledBorder}`,
            }}
          >
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Recording..." : "Save Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
