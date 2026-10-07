"use client";

import React, { useState } from "react";
import { theme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotification } from "@/components/ui/notification";
import { Lock, Eye, EyeOff, KeyRound, Upload, CheckCircle2, ArrowLeft } from "lucide-react";

export interface ResetPasswordCardProps {
  onBackToLogin: () => void;
  onResetSuccess: () => void;
}

export const ResetPasswordCard: React.FC<ResetPasswordCardProps> = ({
  onBackToLogin,
  onResetSuccess,
}) => {
  const { notify } = useNotification();

  const [recoveryFileName, setRecoveryFileName] = useState<string | null>(null);
  const [recoveryContent, setRecoveryContent] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRecoveryFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRecoveryContent(content || "");
      notify(`Loaded recovery file "${file.name}".`, "info");
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recoveryContent.trim()) {
      notify("Please select your password.recovery file first.", "warning", "Recovery File Required");
      return;
    }

    if (!newPassword.trim()) {
      notify("Please enter a new password.", "warning");
      return;
    }

    if (newPassword.trim().length < 4) {
      notify("Password must be at least 4 characters long.", "warning");
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      notify("New password and confirm password do not match.", "error", "Password Mismatch");
      return;
    }

    setLoading(true);

    try {
      if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("reset_password_with_recovery_key", {
          recoveryContent: recoveryContent.trim(),
          newPassword: newPassword.trim(),
        });
      } else {
        // Fallback for standard browser testing
        if (!recoveryContent.includes("INTEFIG-RECOVERY-997-2005")) {
          throw new Error("Invalid recovery file or corrupt master key code.");
        }
        await new Promise((r) => setTimeout(r, 600));
      }

      notify("Password reset successfully! You can now log in with your new password.", "success", "Password Updated");
      onResetSuccess();
    } catch (err: any) {
      const message = typeof err === "string" ? err : err?.message || "Failed to reset password.";
      notify(message, "error", "Reset Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "440px",
        maxHeight: "90vh",
        overflowY: "auto",
        backgroundColor: theme.colors.surfaceContainerLowest,
        border: `1px solid ${theme.colors.outlineVariant}`,
        borderRadius: theme.rounded.lg,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
        padding: "28px 24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Universal Logo */}
      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
        <img
          src="/logo.png"
          alt="BKM Motors Logo"
          style={{
            height: "50px",
            width: "auto",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Header Title */}
      <h1
        style={{
          fontFamily: theme.typography.display.fontFamily,
          fontSize: "26px",
          fontWeight: 700,
          color: theme.colors.primary,
          margin: 0,
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}
      >
        Reset Password
      </h1>
      <p
        style={{
          fontFamily: theme.typography.bodyMd.fontFamily,
          fontSize: "13px",
          color: theme.colors.onSurfaceVariant,
          marginTop: "4px",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        Upload <code style={{ backgroundColor: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", fontSize: "12px", color: theme.colors.primary }}>recovery</code> file to set a new password
      </p>

      <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Recovery File Upload Dropzone */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: theme.colors.onSurface,
              marginBottom: "6px",
            }}
          >
            SELECT RECOVERY FILE (.recovery)
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "14px",
              borderRadius: theme.rounded.DEFAULT,
              border: `2px dashed ${recoveryFileName ? theme.colors.success : theme.colors.primary}`,
              backgroundColor: recoveryFileName ? theme.colors.successContainer : theme.colors.surfaceContainerLow,
              color: recoveryFileName ? theme.colors.onSuccessContainer : theme.colors.primary,
              cursor: "pointer",
              transition: "all 0.15s ease",
              textAlign: "center",
            }}
          >
            <input
              type="file"
              accept=".recovery,.txt,.json"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {recoveryFileName ? (
              <>
                <CheckCircle2 size={20} color={theme.colors.success} />
                <span style={{ fontSize: "13px", fontWeight: 700 }}>{recoveryFileName} Loaded</span>
              </>
            ) : (
              <>
                <Upload size={18} color={theme.colors.primary} />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Click to select password.recovery</span>
              </>
            )}
          </label>
        </div>

        {/* New Password Input */}
        <Input
          id="new-password"
          type={showNewPassword ? "text" : "password"}
          label="NEW PASSWORD"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: theme.colors.onSurfaceVariant,
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        {/* Confirm Password Input */}
        <Input
          id="confirm-password"
          type={showConfirmPassword ? "text" : "password"}
          label="CONFIRM NEW PASSWORD"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          leftIcon={<KeyRound size={16} />}
          rightIcon={
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: theme.colors.onSurfaceVariant,
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        {/* Reset Password Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
          style={{
            height: "44px",
            fontSize: "15px",
            fontWeight: 600,
            marginTop: "6px",
          }}
        >
          {loading ? "Resetting Password..." : "Reset Password"}
        </Button>
      </form>

      {/* Back to Sign In Link */}
      <button
        type="button"
        onClick={onBackToLogin}
        style={{
          marginTop: "22px",
          background: "none",
          border: "none",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: theme.typography.bodyMd.fontFamily,
          fontSize: "13px",
          fontWeight: 600,
          color: theme.colors.onSurfaceVariant,
          cursor: "pointer",
        }}
      >
        <ArrowLeft size={16} />
        Back to Sign In
      </button>
    </div>
  );
};
