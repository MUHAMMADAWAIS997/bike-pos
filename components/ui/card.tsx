"use client";

import React, { HTMLAttributes, forwardRef } from "react";
import { theme } from "@/lib/theme";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: "level0" | "level1" | "level2";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, elevation = "level1", style, className = "", ...props }, ref) => {
    const elevTokens = theme.elevation[elevation];
    const cardTokens = theme.components.cards;

    const cardStyle: React.CSSProperties = {
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      backgroundColor: elevTokens.background || cardTokens.background,
      border: elevTokens.border || cardTokens.border,
      borderRadius: cardTokens.borderRadius,
      boxShadow: elevTokens.boxShadow || "none",
      overflow: "hidden",
      ...style,
    };

    return (
      <div ref={ref} style={cardStyle} className={className} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, style, className = "", ...props }, ref) => {
    const cardTokens = theme.components.cards;

    const headerStyle: React.CSSProperties = {
      padding: cardTokens.padding,
      borderBottom: cardTokens.headerDivider,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      ...style,
    };

    return (
      <div ref={ref} style={headerStyle} className={className} {...props}>
        {children}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ children, style, className = "", ...props }, ref) => {
    const titleStyle: React.CSSProperties = {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: theme.typography.headlineMd.fontSize,
      fontWeight: theme.typography.headlineMd.fontWeight,
      color: theme.colors.onSurface,
      margin: 0,
      ...style,
    };

    return (
      <h3 ref={ref} style={titleStyle} className={className} {...props}>
        {children}
      </h3>
    );
  }
);
CardTitle.displayName = "CardTitle";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, style, className = "", ...props }, ref) => {
    const cardTokens = theme.components.cards;

    const contentStyle: React.CSSProperties = {
      padding: cardTokens.padding,
      ...style,
    };

    return (
      <div ref={ref} style={contentStyle} className={className} {...props}>
        {children}
      </div>
    );
  }
);
CardContent.displayName = "CardContent";
