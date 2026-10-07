"use client";

import React from "react";

export interface WatermarkProps {
  bold?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Watermark: React.FC<WatermarkProps> = ({ bold = false, style, className }) => {
  const textColor = bold ? "#000000" : "rgba(255, 255, 255, 0.65)";
  const linkColor = bold ? "#000000" : "#38bdf8";

  return (
    <div
      className={className}
      style={{
        fontSize: bold ? "12px" : "11px",
        fontWeight: bold ? 700 : 500,
        color: textColor,
        textAlign: "center",
        letterSpacing: "0.02em",
        marginTop: "8px",
        paddingTop: "4px",
        ...style,
      }}
    >
      Software by{" "}
      <a
        href="https://intefig.com/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: linkColor,
          textDecoration: "underline",
          fontWeight: bold ? 800 : 700,
          cursor: "pointer",
        }}
      >
        INTEFIG
      </a>{" "}
      - 03359940100
    </div>
  );
};

export default Watermark;
