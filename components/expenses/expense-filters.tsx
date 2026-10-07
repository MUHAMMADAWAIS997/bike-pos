"use client";

import React from "react";
import { theme } from "@/lib/theme";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { expenseCategories } from "@/lib/validations/expense";

export interface ExpenseFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  orderBy: string;
  setOrderBy: (val: string) => void;
  setPage: (val: number) => void;
  onReset: () => void;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  orderBy,
  setOrderBy,
  setPage,
  onReset,
}) => {
  const isFiltered =
    Boolean(search) ||
    selectedCategory !== "all" ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    orderBy !== "newest";

  return (
    <Card
      style={{
        backgroundColor: theme.cardSchemes.blue.background,
        borderRadius: theme.rounded.lg,
        border: `1px solid ${theme.cardSchemes.blue.border}`,
        marginBottom: "20px",
      }}
    >
      <CardContent style={{ padding: "16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {/* Search Box */}
          <div style={{ flex: "1 1 240px", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "11px", color: theme.colors.onSurfaceVariant }} />
            <input
              type="text"
              placeholder="Search title, ref #, notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: "100%",
                paddingLeft: "36px",
                paddingRight: "12px",
                paddingTop: "8px",
                paddingBottom: "8px",
                border: "1px solid #fecdd3",
                borderRadius: theme.rounded.md,
                fontSize: "14px",
                outline: "none",
                color: "#881337",
                fontWeight: 500,
                backgroundColor: "#ffffff",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ flex: "1 1 160px", minWidth: "140px" }}>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #fecdd3",
                borderRadius: theme.rounded.md,
                fontSize: "14px",
                backgroundColor: "#ffffff",
                color: "#881337",
                fontWeight: 500,
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              <option value="all">All Categories</option>
              <option value="Stock Purchase">Stock Purchase</option>
              {expenseCategories
                .filter((c) => c !== "Stock Purchase")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          {/* Date Range Pickers */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", flex: "1 1 auto" }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "7px 10px",
                border: "1px solid #fecdd3",
                borderRadius: theme.rounded.md,
                fontSize: "13px",
                color: "#881337",
                fontWeight: 500,
                backgroundColor: "#ffffff",
                outline: "none",
                boxSizing: "border-box",
                flex: "1 1 130px",
              }}
            />
            <span style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "7px 10px",
                border: "1px solid #fecdd3",
                borderRadius: theme.rounded.md,
                fontSize: "13px",
                color: "#881337",
                fontWeight: 500,
                backgroundColor: "#ffffff",
                outline: "none",
                boxSizing: "border-box",
                flex: "1 1 130px",
              }}
            />
          </div>

          {/* Sort Selector */}
          <div style={{ flex: "1 1 160px", minWidth: "140px" }}>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #fecdd3",
                borderRadius: theme.rounded.md,
                fontSize: "14px",
                backgroundColor: "#ffffff",
                color: "#881337",
                fontWeight: 500,
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
            </select>
          </div>

          {/* Reset Button */}
          {isFiltered && (
            <Button onClick={onReset} variant="outline" size="sm">
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
