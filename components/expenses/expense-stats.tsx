"use client";

import React from "react";
import { theme } from "@/lib/theme";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, Boxes, Briefcase, Calendar } from "lucide-react";
import { ExpenseStats } from "@/app/expenses/page";

export interface ExpenseStatsProps {
  stats: ExpenseStats;
  formatCurrency: (val: number) => string;
}

export const ExpenseStatsCards: React.FC<ExpenseStatsProps> = ({ stats, formatCurrency }) => {
  const cards = [
    {
      label: "Total Expenses",
      value: stats.total_expenses,
      scheme: theme.cardSchemes.rose,
      icon: Receipt,
    },
    {
      label: "Stock Purchases",
      value: stats.stock_expenses,
      scheme: theme.cardSchemes.emerald,
      icon: Boxes,
    },
    {
      label: "Operational & Other",
      value: stats.operational_expenses,
      scheme: theme.cardSchemes.blue,
      icon: Briefcase,
    },
    {
      label: "This Month",
      value: stats.this_month_expenses,
      scheme: theme.cardSchemes.amber,
      icon: Calendar,
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
      {cards.map((c, idx) => {
        const IconComponent = c.icon;
        return (
          <Card
            key={idx}
            style={{
              backgroundColor: c.scheme.background,
              borderRadius: theme.rounded.lg,
              border: `1px solid ${c.scheme.border}`,
            }}
          >
            <CardContent style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "600", color: c.scheme.text }}>
                    {c.label}
                  </p>
                  <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: c.scheme.titleText }}>
                    {formatCurrency(c.value)}
                  </p>
                </div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    backgroundColor: c.scheme.badgeBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconComponent size={22} color={c.scheme.accent} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
