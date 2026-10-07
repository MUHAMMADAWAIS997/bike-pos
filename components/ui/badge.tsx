"use client";

import React, { HTMLAttributes } from "react";
import { theme } from "@/lib/theme";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "neutral"
  | "violet"
  | "amber"
  | "pink"
  | "cyan";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  style,
  className = "",
  ...props
}) => {
  const badgeTokens = theme.components.badge;

  let bg: string = theme.colors.surfaceContainerHigh;
  let color: string = theme.colors.onSurfaceVariant;
  let border: string = "1px solid transparent";

  if (variant === "violet" || variant === "amber" || variant === "pink" || variant === "cyan") {
    const partner = theme.partnerPalette[variant];
    bg = partner.bg;
    color = partner.main;
    border = `1px solid ${partner.border}`;
  } else if (variant === "primary") {
    bg = "rgba(0, 104, 95, 0.12)";
    color = theme.colors.primary;
    border = "1px solid rgba(0, 104, 95, 0.25)";
  } else if (variant === "secondary") {
    bg = "rgba(0, 81, 213, 0.12)";
    color = theme.colors.secondary;
    border = "1px solid rgba(0, 81, 213, 0.25)";
  } else if (variant === "success") {
    bg = theme.colors.successContainer;
    color = theme.colors.onSuccessContainer;
    border = "1px solid rgba(5, 150, 105, 0.25)";
  } else if (variant === "error") {
    bg = theme.colors.errorContainer;
    color = theme.colors.onErrorContainer;
    border = "1px solid rgba(186, 26, 26, 0.25)";
  }

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "100%",
    boxSizing: "border-box",
    borderRadius: badgeTokens.borderRadius,
    padding: badgeTokens.padding,
    fontFamily: badgeTokens.fontFamily,
    fontSize: badgeTokens.fontSize,
    fontWeight: badgeTokens.fontWeight,
    backgroundColor: bg,
    color: color,
    border: border,
    whiteSpace: "nowrap",
    ...style,
  };

  return (
    <span style={badgeStyle} className={className} {...props}>
      {children}
    </span>
  );
};
