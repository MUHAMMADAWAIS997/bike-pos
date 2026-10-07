"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { theme } from "@/lib/theme";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "error" | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      style,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      className = "",
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isActive, setIsActive] = React.useState(false);

    const variantTokens = (theme.components.buttons as any)[variant] || theme.components.buttons.primary;
    const sizeTokens = theme.components.buttons.sizes[size] || theme.components.buttons.sizes.md;

    let background: string = variantTokens.background;
    if (disabled) {
      background = theme.colors.disabledBackground;
    } else if (isActive && "activeBackground" in variantTokens) {
      background = variantTokens.activeBackground;
    } else if (isHovered && "hoverBackground" in variantTokens) {
      background = variantTokens.hoverBackground;
    }

    const color: string = disabled ? theme.colors.disabledText : variantTokens.color;
    const border: string = disabled
      ? `1px solid ${theme.colors.disabledBorder}`
      : variantTokens.border || "none";

    const defaultShadow = variantTokens.boxShadow || "none";
    const hoverShadow = isHovered && !disabled && variantTokens.boxShadow ? "0 4px 12px rgba(0,0,0,0.18)" : defaultShadow;

    // Strip backgroundColor from style prop to prevent shorthand (background) vs longhand (backgroundColor) DOM conflict in React 19
    const { backgroundColor: userBgColor, ...cleanStyle } = (style || {}) as any;
    const activeBackground = (isHovered || isActive) && !disabled ? background : (userBgColor || background);

    const buttonStyle: React.CSSProperties = {
      display: "inline-flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontWeight: 600,
      fontSize: sizeTokens.fontSize,
      height: sizeTokens.height,
      padding: sizeTokens.padding,
      borderRadius: variantTokens.borderRadius || theme.rounded.md,
      background: activeBackground,
      color: color,
      border: border,
      cursor: disabled ? "not-allowed" : "pointer",
      width: fullWidth ? "100%" : "auto",
      maxWidth: "100%",
      boxSizing: "border-box",
      whiteSpace: "nowrap",
      transition: "all 0.15s ease-in-out",
      outline: "none",
      boxShadow: disabled ? "none" : hoverShadow,
      transform: isHovered && !disabled ? "translateY(-1px)" : "none",
      ...cleanStyle,
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        style={buttonStyle}
        onMouseEnter={(e) => {
          setIsHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          setIsActive(false);
          onMouseLeave?.(e);
        }}
        onMouseDown={(e) => {
          setIsActive(true);
          onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          setIsActive(false);
          onMouseUp?.(e);
        }}
        className={className}
        {...props}
      >
        {leftIcon && <span style={{ display: "inline-flex", alignItems: "center" }}>{leftIcon}</span>}
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>{children}</span>
        {rightIcon && <span style={{ display: "inline-flex", alignItems: "center" }}>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
