"use client";

import React, { useState } from "react";
import { theme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotification } from "@/components/ui/notification";
import { customerSchema, CustomerInput } from "@/lib/validations/customer";
import { X, UserPlus } from "lucide-react";

export interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerAdded,
}) => {
  const { notify } = useNotification();

  const [formData, setFormData] = useState<CustomerInput>({
    name: "",
    address: "",
    cnic: "",
    mobile: "",
  });

  const [errors, setErrors] = useState<{ [K in keyof CustomerInput]?: string }>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof CustomerInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError(null);
  };

  const validate = (): boolean => {
    setErrors({});
    setServerError(null);

    const result = customerSchema.safeParse(formData);
    if (!result.success) {
      const formatted = result.error.format();
      setErrors({
        name: formatted.name?._errors[0],
        address: formatted.address?._errors[0],
        cnic: formatted.cnic?._errors[0],
        mobile: formatted.mobile?._errors[0],
      });
      notify("Please fix the validation errors in the form.", "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("add_customer", {
          name: formData.name.trim(),
          address: formData.address.trim(),
          cnic: formData.cnic.trim(),
          mobile: formData.mobile.trim(),
        });
      } else {
        // Fallback for web browser environment
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      notify(`Customer "${formData.name.trim()}" added successfully!`, "success");
      setFormData({ name: "", address: "", cnic: "", mobile: "" });
      onCustomerAdded();
      onClose();
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to add customer.";
      setServerError(msg);
      notify(msg, "error", "Submission Failed");
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
          maxWidth: "500px",
          maxHeight: "90vh",
          backgroundColor: theme.cardSchemes.emerald.background,
          border: `1px solid ${theme.cardSchemes.emerald.border}`,
          borderRadius: theme.rounded.lg,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: `1px solid ${theme.cardSchemes.emerald.headerBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.cardSchemes.emerald.badgeBg,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <UserPlus size={20} color={theme.cardSchemes.emerald.accent} />
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontFamily: theme.typography.headlineMd.fontFamily,
                fontWeight: 700,
                color: theme.cardSchemes.emerald.titleText,
              }}
            >
              Add New Customer
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

        {/* Modal Body / Form */}
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
            label="CUSTOMER NAME"
            placeholder="Muhammad Ali"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            disabled={loading}
          />

          <Input
            label="MOBILE NO"
            placeholder="03001234567"
            value={formData.mobile}
            onChange={(e) => handleChange("mobile", e.target.value)}
            error={errors.mobile}
            disabled={loading}
          />

          <Input
            label="CNIC NO"
            placeholder="42101-1234567-1"
            value={formData.cnic}
            onChange={(e) => handleChange("cnic", e.target.value)}
            error={errors.cnic}
            disabled={loading}
          />

          <Input
            label="ADDRESS"
            placeholder="House 42, Block 6, PECHS, Karachi"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            error={errors.address}
            disabled={loading}
          />

          {/* Modal Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "12px",
              paddingTop: "16px",
              borderTop: `1px solid ${theme.colors.disabledBorder}`,
            }}
          >
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
