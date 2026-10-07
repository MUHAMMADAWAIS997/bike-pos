"use client";

import React, { useState } from "react";
import { theme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotification } from "@/components/ui/notification";
import { loginSchema } from "@/lib/validations/auth";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

import { getTrialInfo } from "@/lib/trial";

export interface LoginCardProps {
  onSuccess: () => void;
  onForgotClick?: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onSuccess, onForgotClick }) => {
  const { notify } = useNotification();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    setUsernameError(null);
    setPasswordError(null);

    const validationResult = loginSchema.safeParse({
      username: username.trim(),
      password: password.trim(),
    });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.format();
      if (fieldErrors.username?._errors.length) {
        setUsernameError(fieldErrors.username._errors[0]);
      }
      if (fieldErrors.password?._errors.length) {
        setPasswordError(fieldErrors.password._errors[0]);
      }
      notify("Please fill in required fields correctly.", "warning");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trial = getTrialInfo();
    if (trial.isExpired) {
      notify(`${trial.totalDays}-days evaluation trial has expired. Contact INTEFIG to unlock system.`, "error", "Trial Expired");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Execute via Tauri command (Desktop Rust Layer -> SQLite)
      if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("login", { username: username.trim(), password: password.trim() });
      } else {
        // Fallback for standard web browser environment
        if (username.trim() === "admin" && password.trim() === "admin123") {
          await new Promise((resolve) => setTimeout(resolve, 400));
        } else {
          throw new Error("Invalid username or password.");
        }
      }

      notify("Authenticated successfully! Welcome to BKM Motors.", "success");
      onSuccess();
    } catch (err: any) {
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Invalid username or password.";

      // Dispatch top-center notification
      notify(message, "error", "Authentication Failed");
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
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
        <img
          src="/logo.png"
          alt="BKM Motors Logo"
          style={{
            height: "56px",
            width: "auto",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Brand Title & Subtitle */}
      <h1
        style={{
          fontFamily: theme.typography.display.fontFamily,
          fontSize: "30px",
          fontWeight: 700,
          color: theme.colors.primary,
          margin: 0,
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}
      >
        BKM Motors
      </h1>
      <p
        style={{
          fontFamily: theme.typography.bodyMd.fontFamily,
          fontSize: "14px",
          color: theme.colors.onSurfaceVariant,
          marginTop: "6px",
          marginBottom: "32px",
          textAlign: "center",
        }}
      >
        Sign in to your POS System
      </p>

      {/* Login Form */}
      <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* User Name Field with Inline Error Support */}
        <Input
          id="username"
          type="text"
          label="USER NAME"
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          error={usernameError || undefined}
          leftIcon={<User size={16} />}
        />

        {/* Password Field with Inline Error Support */}
        <div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            label="PASSWORD"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={passwordError || undefined}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
            <button
              type="button"
              onClick={() => {
                if (onForgotClick) {
                  onForgotClick();
                } else {
                  notify("Default credentials: Username='admin', Password='admin123'.", "info", "Default Access");
                }
              }}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontFamily: theme.typography.bodyMd.fontFamily,
                fontSize: "13px",
                fontWeight: 600,
                color: theme.colors.primary,
                cursor: "pointer",
                textDecoration: "none",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1.0")}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
          style={{
            height: "44px",
            fontSize: "15px",
            fontWeight: 600,
            marginTop: "8px",
          }}
          rightIcon={!loading && <ArrowRight size={18} />}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Footer Info */}
      <div
        style={{
          marginTop: "32px",
          textAlign: "center",
          fontFamily: theme.typography.labelMd.fontFamily,
          fontSize: "12px",
          color: theme.colors.onSurfaceVariant,
          lineHeight: "1.6",
        }}
      >
        <div>Authorized Personnel Only.</div>
      </div>
    </div>
  );
};
