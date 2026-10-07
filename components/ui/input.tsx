"use client";

import React, { InputHTMLAttributes, forwardRef, useState } from "react";
import { theme } from "@/lib/theme";
import { AlertCircle, Info, CheckCircle2 } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  infoText?: string;
  successText?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      infoText,
      successText,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled,
      style,
      onFocus,
      onBlur,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const formTokens = theme.components.formFields;

    const borderColor: string = error
      ? theme.colors.error
      : isFocused
      ? formTokens.focusBorder
      : "#cbd5e1";

    const boxShadow: string = isFocused && !disabled
      ? error
        ? `0 0 0 2px rgba(186, 26, 26, 0.2)`
        : formTokens.focusGlow
      : "none";

    const containerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: "3px",
      width: fullWidth ? "100%" : "auto",
      maxWidth: "100%",
      boxSizing: "border-box",
    };

    const labelStyle: React.CSSProperties = {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: "11px",
      fontWeight: 600,
      color: theme.colors.onSurface,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    };

    const wrapperStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      position: "relative",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      backgroundColor: disabled ? theme.colors.disabledBackground : formTokens.background,
      border: `1.5px solid ${borderColor}`,
      borderRadius: formTokens.borderRadius,
      boxShadow: boxShadow,
      transition: "all 0.15s ease-in-out",
      height: formTokens.height,
    };

    const inputStyle: React.CSSProperties = {
      width: "100%",
      height: "100%",
      paddingLeft: leftIcon ? "36px" : "12px",
      paddingRight: rightIcon ? "36px" : "12px",
      fontSize: formTokens.fontSize,
      fontFamily: formTokens.fontFamily,
      color: disabled ? theme.colors.disabledText : formTokens.color,
      backgroundColor: "transparent",
      border: "none",
      outline: "none",
      boxSizing: "border-box",
      ...style,
    };

    const iconStyle = (position: "left" | "right"): React.CSSProperties => ({
      position: "absolute",
      [position]: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: error ? theme.colors.error : theme.colors.onSurfaceVariant,
      pointerEvents: position === "right" ? "auto" : "none",
    });

    // Determine inline message type
    const inlineMessage = error || successText || infoText || helperText;
    const isError = Boolean(error);
    const isSuccess = Boolean(successText);
    const isInfo = Boolean(infoText);

    let inlineColor: string = theme.colors.onSurfaceVariant;
    if (isError) inlineColor = theme.colors.error;
    else if (isSuccess) inlineColor = theme.colors.success;
    else if (isInfo) inlineColor = theme.colors.primary;

    return (
      <div style={containerStyle} className={className}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <div style={wrapperStyle}>
          {leftIcon && <div style={iconStyle("left")}>{leftIcon}</div>}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            style={inputStyle}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
          {rightIcon && <div style={iconStyle("right")}>{rightIcon}</div>}
        </div>

        {/* Inline Error / Information Message */}
        {inlineMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontFamily: theme.typography.bodyMd.fontFamily,
              fontSize: "12px",
              color: inlineColor,
              marginTop: "2px",
            }}
          >
            {isError && <AlertCircle size={13} style={{ flexShrink: 0 }} />}
            {isSuccess && <CheckCircle2 size={13} style={{ flexShrink: 0 }} />}
            {isInfo && <Info size={13} style={{ flexShrink: 0 }} />}
            <span>{inlineMessage}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
