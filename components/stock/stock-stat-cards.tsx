"use client";

import React from "react";
import { theme } from "@/lib/theme";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  Package,
  DollarSign,
  Layers,
  ArrowUpRight,
  PieChart,
  Percent,
} from "lucide-react";

export interface StockStatData {
  /** Current stock intake / investment cost in PKR */
  currentCost: number;
  /** Estimated retail gross revenue in PKR */
  estimatedRevenue: number;
  /** Total units in stock */
  totalQuantity: number;
  /** Estimated net profit in PKR (Revenue - Cost) */
  estimatedProfit?: number;
  /** Calculated margin / ROI percentage */
  marginPercent?: number;
  /** Count of distinct product models or line items */
  totalModels?: number;
}

export interface StockStatCardsProps {
  stats: StockStatData;
  /** Optional title heading above stats row */
  title?: string;
  /** Compact density layout if true */
  compact?: boolean;
}

export const StockStatCards: React.FC<StockStatCardsProps> = ({
  stats,
  title,
  compact = false,
}) => {
  const fmt = (val: number) =>
    `Rs. ${val.toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const currentCost = stats.currentCost || 0;
  const estimatedRevenue = stats.estimatedRevenue || 0;
  const totalQuantity = stats.totalQuantity || 0;
  const estimatedProfit =
    stats.estimatedProfit !== undefined
      ? stats.estimatedProfit
      : estimatedRevenue - currentCost;

  const marginPercent =
    stats.marginPercent !== undefined
      ? stats.marginPercent
      : currentCost > 0
      ? (estimatedProfit / currentCost) * 100
      : 0;

  const totalModels = stats.totalModels || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "4px",
              height: "16px",
              backgroundColor: theme.colors.primary,
              borderRadius: "2px",
            }}
          />
          <h2
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: theme.colors.onSurface,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {title}
          </h2>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact
            ? "repeat(auto-fit, minmax(190px, 1fr))"
            : "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "16px",
        }}
      >
        {/* ============================================================ */}
        {/* VARIANT 1: Hero Gradient Card (Current Stock Cost)           */}
        {/* ============================================================ */}
        <Card
          style={{
            background: "linear-gradient(135deg, #004d40 0%, #00685f 50%, #008378 100%)",
            borderRadius: theme.rounded.xl,
            border: "1px solid rgba(0, 131, 120, 0.4)",
            boxShadow: "0 6px 20px rgba(0, 104, 95, 0.22)",
            color: "#ffffff",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Subtle background glow circle */}
          <div
            style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              pointerEvents: "none",
            }}
          />
          <CardContent style={{ padding: compact ? "14px 16px" : "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  Current Stock Cost
                </span>
                <div
                  style={{
                    fontSize: compact ? "19px" : "23px",
                    fontWeight: 800,
                    color: "#ffffff",
                    marginTop: "6px",
                    lineHeight: 1.1,
                  }}
                >
                  {fmt(currentCost)}
                </div>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Wallet size={20} color="#ffffff" />
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <ArrowUpRight size={12} /> Capital Invested
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* VARIANT 2: Glassmorphic Left-Accent Card (Estimated Revenue) */}
        {/* ============================================================ */}
        <Card
          style={{
            backgroundColor: theme.cardSchemes.blue.background,
            borderRadius: theme.rounded.xl,
            border: `1px solid ${theme.cardSchemes.blue.border}`,
            borderLeft: `5px solid ${theme.cardSchemes.blue.accent}`,
            boxShadow: "0 4px 16px rgba(2, 132, 199, 0.08)",
            overflow: "hidden",
          }}
        >
          <CardContent style={{ padding: compact ? "14px 16px" : "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: theme.cardSchemes.blue.text,
                  }}
                >
                  Estimated Revenue
                </span>
                <div
                  style={{
                    fontSize: compact ? "19px" : "23px",
                    fontWeight: 800,
                    color: theme.cardSchemes.blue.titleText,
                    marginTop: "6px",
                    lineHeight: 1.1,
                  }}
                >
                  {fmt(estimatedRevenue)}
                </div>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: theme.cardSchemes.blue.badgeBg,
                  border: `1px solid ${theme.cardSchemes.blue.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <TrendingUp size={20} color={theme.cardSchemes.blue.accent} />
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
              }}
            >
              <span
                style={{
                  backgroundColor: theme.cardSchemes.blue.badgeBg,
                  color: theme.cardSchemes.blue.text,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <PieChart size={12} /> Gross Retail Valuation
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* VARIANT 3: Emerald Trend Card (Estimated Net Profit & ROI)   */}
        {/* ============================================================ */}
        <Card
          style={{
            backgroundColor: theme.cardSchemes.emerald.background,
            borderRadius: theme.rounded.xl,
            border: `1px solid ${theme.cardSchemes.emerald.border}`,
            boxShadow: "0 4px 16px rgba(22, 163, 74, 0.08)",
            overflow: "hidden",
          }}
        >
          <CardContent style={{ padding: compact ? "14px 16px" : "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: theme.cardSchemes.emerald.text,
                  }}
                >
                  Estimated Net Profit
                </span>
                <div
                  style={{
                    fontSize: compact ? "19px" : "23px",
                    fontWeight: 800,
                    color: theme.cardSchemes.emerald.accent,
                    marginTop: "6px",
                    lineHeight: 1.1,
                  }}
                >
                  +{fmt(estimatedProfit)}
                </div>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: theme.cardSchemes.emerald.badgeBg,
                  border: `1px solid ${theme.cardSchemes.emerald.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <DollarSign size={20} color={theme.cardSchemes.emerald.accent} />
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
              }}
            >
              <span
                style={{
                  backgroundColor: theme.cardSchemes.emerald.badgeBg,
                  color: theme.cardSchemes.emerald.titleText,
                  border: `1px solid ${theme.cardSchemes.emerald.border}`,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Percent size={12} /> {marginPercent.toFixed(1)}% ROI Margin
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* VARIANT 4: Purple Badge Pill Card (Stock Quantity Units)     */}
        {/* ============================================================ */}
        <Card
          style={{
            backgroundColor: theme.cardSchemes.purple.background,
            borderRadius: theme.rounded.xl,
            border: `1px solid ${theme.cardSchemes.purple.border}`,
            boxShadow: "0 4px 16px rgba(147, 51, 234, 0.08)",
            overflow: "hidden",
          }}
        >
          <CardContent style={{ padding: compact ? "14px 16px" : "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: theme.cardSchemes.purple.text,
                  }}
                >
                  Stock Quantity
                </span>
                <div
                  style={{
                    fontSize: compact ? "19px" : "23px",
                    fontWeight: 800,
                    color: theme.cardSchemes.purple.titleText,
                    marginTop: "6px",
                    lineHeight: 1.1,
                  }}
                >
                  {totalQuantity} Units
                </div>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: theme.cardSchemes.purple.badgeBg,
                  border: `1px solid ${theme.cardSchemes.purple.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Package size={20} color={theme.cardSchemes.purple.accent} />
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
              }}
            >
              <span
                style={{
                  backgroundColor: theme.cardSchemes.purple.badgeBg,
                  color: theme.cardSchemes.purple.text,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontWeight: 600,
                }}
              >
                Physical Available Inventory
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* VARIANT 5: Slate Split Card (Product Models / Line Items)    */}
        {/* ============================================================ */}
        {totalModels > 0 && (
          <Card
            style={{
              backgroundColor: theme.cardSchemes.slate.background,
              borderRadius: theme.rounded.xl,
              border: `1px solid ${theme.cardSchemes.slate.border}`,
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
              overflow: "hidden",
            }}
          >
            <CardContent style={{ padding: compact ? "14px 16px" : "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: theme.cardSchemes.slate.text,
                    }}
                  >
                    Product Models / Lines
                  </span>
                  <div
                    style={{
                      fontSize: compact ? "19px" : "23px",
                      fontWeight: 800,
                      color: theme.cardSchemes.slate.titleText,
                      marginTop: "6px",
                      lineHeight: 1.1,
                    }}
                  >
                    {totalModels} {totalModels === 1 ? "Item" : "Items"}
                  </div>
                </div>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    backgroundColor: theme.cardSchemes.slate.badgeBg,
                    border: `1px solid ${theme.cardSchemes.slate.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Layers size={20} color={theme.cardSchemes.slate.accent} />
                </div>
              </div>

              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                }}
              >
                <span
                  style={{
                    backgroundColor: theme.cardSchemes.slate.badgeBg,
                    color: theme.cardSchemes.slate.text,
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontWeight: 600,
                  }}
                >
                  Catalog Variants Recorded
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StockStatCards;
