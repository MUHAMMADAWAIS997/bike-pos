"use client";

import React, { useState } from "react";
import { theme } from "@/lib/theme";
import { Button, Input } from "@/components/ui";
import { partnerSchema } from "@/lib/validations/partner";
import { useNotification } from "@/components/ui/notification";
import { X, Handshake } from "lucide-react";

interface AddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPartnerModal({
  isOpen,
  onClose,
  onSuccess,
}: AddPartnerModalProps) {
  const { notify } = useNotification();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [equityShare, setEquityShare] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const parsedEquity = parseFloat(equityShare);
    const result = partnerSchema.safeParse({
      name: name.trim(),
      mobile: mobile.trim(),
      equityShare: isNaN(parsedEquity) ? undefined : parsedEquity,
    });

    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const validatedData = result.data;
    setLoading(true);

    try {
      if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("add_partner", {
          name: validatedData.name,
          mobile: validatedData.mobile,
          equityShare: validatedData.equityShare,
        });
      } else {
        await new Promise((res) => setTimeout(res, 500));
      }

      notify(`Partner "${validatedData.name}" added successfully!`, "success");
      setName("");
      setMobile("");
      setEquityShare("");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "Failed to add partner.";
      setServerError(msg);
      notify(msg, "error", "Submission Error");
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
          maxWidth: "460px",
          maxHeight: "90vh",
          backgroundColor: theme.cardSchemes.purple.background,
          border: `1px solid ${theme.cardSchemes.purple.border}`,
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
            padding: "16px 20px",
            borderBottom: `1px solid ${theme.cardSchemes.purple.headerBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.cardSchemes.purple.badgeBg,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Handshake size={20} color={theme.cardSchemes.purple.accent} />
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 700,
                color: theme.cardSchemes.purple.titleText,
                fontFamily: theme.typography.headlineLg.fontFamily,
              }}
            >
              Add New Partner
            </h3>
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
              borderRadius: theme.rounded.DEFAULT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px", overflowY: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {serverError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: theme.rounded.DEFAULT,
                  backgroundColor: theme.colors.errorContainer,
                  color: theme.colors.onErrorContainer,
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {serverError}
              </div>
            )}

            <Input
              label="PARTNER NAME *"
              placeholder="e.g. Usman Khan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              disabled={loading}
            />

            <Input
              label="MOBILE PHONE NUMBER *"
              placeholder="e.g. 0300-9876543"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              error={errors.mobile}
              disabled={loading}
            />

            <Input
              label="INVESTMENT EQUITY SHARE (%) *"
              placeholder="e.g. 35.50"
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              value={equityShare}
              onChange={(e) => setEquityShare(e.target.value)}
              error={errors.equityShare}
              disabled={loading}
            />
          </div>

          {/* Form Actions */}
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Adding Partner..." : "Add Partner"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
