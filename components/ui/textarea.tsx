"use client";

import React, { TextareaHTMLAttributes, forwardRef, useState } from "react";
import { theme } from "@/lib/theme";
import { AlertCircle, Info, CheckCircle2 } from "lucide-react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  infoText?: string;
  successText?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      infoText,
      successText,
      helperText,
      fullWidth = true,
      disabled,
      style,
      onFocus,
      onBlur,
      className = "",
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

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

    const textareaStyle: React.CSSProperties = {
      width: "100%",
      maxWidth: "100%",
      padding: "8px 12px",
      fontSize: formTokens.fontSize,
      fontFamily: formTokens.fontFamily,
      color: disabled ? theme.colors.disabledText : formTokens.color,
      backgroundColor: disabled ? theme.colors.disabledBackground : "#ffffff",
      border: `1.5px solid ${borderColor}`,
      borderRadius: formTokens.borderRadius,
      boxShadow: boxShadow,
      outline: "none",
      resize: "vertical",
      boxSizing: "border-box",
      transition: "all 0.15s ease-in-out",
      ...style,
    };

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
          <label htmlFor={textareaId} style={labelStyle}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          style={textareaStyle}
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

Textarea.displayName = "Textarea";
