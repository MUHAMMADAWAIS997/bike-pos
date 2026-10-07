"use client";

import React, { HTMLAttributes, TableHTMLAttributes, forwardRef } from "react";
import { theme } from "@/lib/theme";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  fullWidth?: boolean;
  maxHeight?: string | number;
  containerStyle?: React.CSSProperties;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, fullWidth = true, maxHeight, containerStyle, style, className = "", ...props }, ref) => {
    const mergedContainerStyle: React.CSSProperties = {
      width: fullWidth ? "100%" : "auto",
      maxWidth: "100%",
      maxHeight: maxHeight ?? undefined,
      overflowX: "auto",
      overflowY: maxHeight ? "auto" : "visible",
      boxSizing: "border-box",
      borderRadius: theme.rounded.lg,
      border: `1px solid ${theme.colors.disabledBorder}`,
      backgroundColor: theme.colors.surfaceContainerLowest,
      WebkitOverflowScrolling: "touch",
      position: "relative",
      ...containerStyle,
    };

    const tableStyle: React.CSSProperties = {
      width: "100%",
      minWidth: style?.minWidth || "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
      textAlign: "left",
      boxSizing: "border-box",
      ...style,
    };

    return (
      <div style={mergedContainerStyle}>
        <table ref={ref} style={tableStyle} className={className} {...props}>
          {children}
        </table>
      </div>
    );
  }
);
Table.displayName = "Table";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ children, style, ...props }, ref) => {
  const headerTokens = theme.components.dataTables.header;
  const headerStyle: React.CSSProperties = {
    backgroundColor: headerTokens.background,
    borderBottom: headerTokens.borderBottom,
    ...style,
  };

  return (
    <thead ref={ref} style={headerStyle} {...props}>
      {children}
    </thead>
  );
});
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ children, style, ...props }, ref) => {
  return (
    <tbody ref={ref} style={style} {...props}>
      {children}
    </tbody>
  );
});
TableBody.displayName = "TableBody";

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  isHeader?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, isHeader = false, style, className = "", ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const rowTokens = theme.components.dataTables.rows;

    const rowStyle: React.CSSProperties = {
      borderBottom: isHeader ? "none" : rowTokens.divider,
      backgroundColor: !isHeader && isHovered ? rowTokens.hoverBackground : "transparent",
      transition: "background-color 0.1s ease",
      ...style,
    };

    return (
      <tr
        ref={ref}
        style={rowStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={className}
        {...props}
      >
        {children}
      </tr>
    );
  }
);
TableRow.displayName = "TableRow";

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
  sticky?: boolean;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, align = "left", sticky = false, style, className = "", ...props }, ref) => {
    const headerTokens = theme.components.dataTables.header;

    const headStyle: React.CSSProperties = {
      padding: "10px 14px",
      fontFamily: headerTokens.fontFamily,
      fontSize: "11px",
      fontWeight: 600,
      color: headerTokens.color,
      textTransform: headerTokens.textTransform,
      textAlign: align,
      letterSpacing: "0.05em",
      whiteSpace: "nowrap",
      borderBottom: headerTokens.borderBottom,
      ...(sticky
        ? {
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "#f8fafc",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }
        : {}),
      ...style,
    };

    return (
      <th ref={ref} style={headStyle} className={className} {...props}>
        {children}
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
  isNumeric?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, align = "left", isNumeric = false, style, className = "", ...props }, ref) => {
    const rowTokens = theme.components.dataTables.rows;
    const cellTokens = theme.components.dataTables.cells;

    const cellStyle: React.CSSProperties = {
      padding: "10px 14px",
      fontFamily: isNumeric ? cellTokens.numericFontFamily : rowTokens.fontFamily,
      fontSize: "13px",
      color: cellTokens.color,
      textAlign: align,
      whiteSpace: "nowrap",
      ...style,
    };

    return (
      <td ref={ref} style={cellStyle} className={className} {...props}>
        {children}
      </td>
    );
  }
);
TableCell.displayName = "TableCell";
