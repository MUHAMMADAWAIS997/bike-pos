"use client";

import React from "react";
import { theme } from "@/lib/theme";

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  variant?: "primary" | "purple" | "emerald" | "amber";
  className?: string;
  style?: React.CSSProperties;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
  label,
  description,
  icon,
  badge,
  variant = "purple",
  className = "",
  style,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  // Color mapping based on variant
  let activeTrackBg: string = theme.colors.primary;
  let activeBorder: string = theme.colors.primary;

  if (variant === "purple") {
    activeTrackBg = theme.cardSchemes.purple.accent; // #9333ea
    activeBorder = theme.cardSchemes.purple.accent;
  } else if (variant === "emerald") {
    activeTrackBg = theme.cardSchemes.emerald.accent; // #16a34a
    activeBorder = theme.cardSchemes.emerald.accent;
  } else if (variant === "amber") {
    activeTrackBg = theme.cardSchemes.amber.accent;
    activeBorder = theme.cardSchemes.amber.accent;
  }

  const inactiveTrackBg = "#cbd5e1";
  const inactiveBorder = "#94a3b8";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        padding: "14px 16px",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        borderRadius: theme.rounded.lg,
        backgroundColor: checked
          ? variant === "purple"
            ? "#f5f3ff"
            : variant === "emerald"
            ? "#f0fdf4"
            : "#f8fafc"
          : "#ffffff",
        border: `1.5px solid ${
          checked
            ? variant === "purple"
              ? "#ddd6fe"
              : variant === "emerald"
              ? "#bbf7d0"
              : "#cbd5e1"
            : "#e2e8f0"
        }`,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        boxShadow: checked ? "0 2px 8px rgba(0, 0, 0, 0.04)" : "none",
        ...style,
      }}
      className={className}
      onClick={handleClick}
    >
      {/* Left section: Icon + Label + Description */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: 0 }}>
        {icon && (
          <div
            style={{
              padding: "8px",
              borderRadius: theme.rounded.md,
              backgroundColor: checked
                ? variant === "purple"
                  ? "#ede9fe"
                  : "#e2e8f0"
                : "#f1f5f9",
              color: checked ? activeTrackBg : "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s ease",
            }}
          >
            {icon}
          </div>
        )}

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {label && (
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: theme.colors.onSurface,
                  lineHeight: "1.3",
                }}
              >
                {label}
              </span>
            )}
            {badge && <div>{badge}</div>}
          </div>

          {description && (
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "12.5px",
                color: theme.colors.onSurfaceVariant,
                lineHeight: "1.4",
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Switch Control */}
      <div
        id={id}
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        style={{
          position: "relative",
          width: "44px",
          height: "24px",
          borderRadius: "12px",
          backgroundColor: checked ? activeTrackBg : inactiveTrackBg,
          transition: "background-color 0.25s ease, border-color 0.25s ease",
          flexShrink: 0,
          marginTop: "2px",
          outline: "none",
          boxShadow: checked
            ? `0 0 0 2px rgba(147, 51, 234, 0.15)`
            : "none",
        }}
      >
        {/* Toggle Knob */}
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "22px" : "2px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.25)",
            transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Subtle dot inside knob when checked */}
          {checked && (
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: activeTrackBg,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
