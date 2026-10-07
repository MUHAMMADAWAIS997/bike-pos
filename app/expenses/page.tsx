"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
} from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import { AddExpenseModal } from "@/components/expenses/add-expense-modal";
import { ExpenseDetailsModal } from "@/components/expenses/expense-details-modal";
import { DeleteExpenseModal } from "@/components/expenses/delete-expense-modal";
import { ExpenseStatsCards } from "@/components/expenses/expense-stats";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Receipt,
  RefreshCw,
} from "lucide-react";

export interface ExpenseRecord {
  id: string;
  title: string;
  category: string;
  amount: number;
  payment_method: string;
  reference_id?: string | null;
  description?: string | null;
  created_at: string;
}

export interface ExpenseStats {
  total_expenses: number;
  stock_expenses: number;
  operational_expenses: number;
  this_month_expenses: number;
  total_count: number;
}

const getInitialDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${day}`,
  };
};

export default function ExpensesPage() {
  const { notify } = useNotification();
  const initialDates = getInitialDates();

  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [stats, setStats] = useState<ExpenseStats>({
    total_expenses: 0,
    stock_expenses: 0,
    operational_expenses: 0,
    this_month_expenses: 0,
    total_count: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [orderBy, setOrderBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDetailExpense, setSelectedDetailExpense] = useState<ExpenseRecord | null>(null);
  const [deleteTargetExpense, setDeleteTargetExpense] = useState<ExpenseRecord | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: any = await invoke("get_expenses", {
        search,
        category: selectedCategory,
        startDate,
        endDate,
        orderBy,
        page,
        perPage,
      });

      if (res) {
        setExpenses(res.expenses || []);
        setTotalCount(res.total_count || 0);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch expenses", err);
      notify("Failed to load expenses list", "error");
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, startDate, endDate, orderBy, page, perPage, notify]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetExpense) return;

    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("delete_expense", { id: deleteTargetExpense.id });

      notify(`Expense "${deleteTargetExpense.title}" deleted.`, "success");
      setDeleteTargetExpense(null);
      fetchExpenses();
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to delete expense.";
      notify(msg, "error");
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setStartDate(initialDates.start);
    setEndDate(initialDates.end);
    setOrderBy("newest");
    setPage(1);
  };

  const formatCurrency = (val: number) => {
    return `Rs. ${val.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case "Stock Purchase":
        return { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" };
      case "Utilities":
        return { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
      case "Rent":
        return { bg: "#fff7ed", color: "#c2410c", border: "#ffedd5" };
      case "Salaries":
        return { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" };
      case "Maintenance":
        return { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
      case "Marketing":
        return { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };
      default:
        return { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" };
    }
  };

  const totalPages = Math.ceil(totalCount / perPage) || 1;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "24px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontFamily: theme.typography.display.fontFamily,
                fontWeight: "700",
                color: theme.colors.onSurface,
                margin: "0 0 4px 0",
                letterSpacing: "-0.02em",
              }}
            >
              Expense Tracker
            </h1>
            <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant }}>
              Monitor inventory stock purchases and record operational business expenses
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Button
              onClick={() => {
                fetchExpenses();
                notify("Expense list refreshed", "info");
              }}
              variant="outline"
              leftIcon={<RefreshCw size={16} className={loading ? "animate-spin" : ""} />}
            >
              Refresh
            </Button>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              leftIcon={<Plus size={18} />}
            >
              Add Expense
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <ExpenseStatsCards stats={stats} formatCurrency={formatCurrency} />

        {/* Filter Controls Bar */}
        <ExpenseFilters
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          setPage={setPage}
          onReset={handleResetFilters}
        />

        {/* Expenses Table Card */}
        <Card style={{ backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.rounded.lg, border: `1px solid ${theme.colors.outlineVariant}`, overflow: "hidden" }}>
          <Table>
            <TableHeader>
              <TableRow isHeader>
                <TableHead>DATE</TableHead>
                <TableHead>EXPENSE TITLE / SOURCE</TableHead>
                <TableHead>CATEGORY</TableHead>
                <TableHead>PAYMENT METHOD</TableHead>
                <TableHead align="right">AMOUNT</TableHead>
                <TableHead align="center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" style={{ padding: "40px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <RefreshCw size={28} color={theme.colors.primary} className="animate-spin" />
                      <p style={{ margin: 0, color: theme.colors.onSurfaceVariant, fontSize: "14px" }}>Loading expense records...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" style={{ padding: "48px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <Receipt size={40} color={theme.colors.outline} />
                      <div>
                        <p style={{ margin: "0 0 4px 0", fontWeight: 600, fontSize: "16px", color: theme.colors.onSurface }}>No Expenses Found</p>
                        <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant }}>
                          No expense records match your search query or filter selection.
                        </p>
                      </div>
                      <Button
                        onClick={() => setIsAddModalOpen(true)}
                        variant="primary"
                        leftIcon={<Plus size={16} />}
                        style={{ marginTop: "8px" }}
                      >
                        Record First Expense
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => {
                  const badgeStyle = getCategoryBadgeStyle(expense.category);
                  const isStock = expense.category === "Stock Purchase";

                  // Format concise title and batch subtitle
                  let displayTitle = expense.title;
                  let displaySubtitle = expense.description;

                  if (isStock) {
                    displayTitle = "Stock Intake";
                    if (expense.title.includes("Batch #")) {
                      const bNo = expense.title.split("Batch #")[1]?.trim();
                      displaySubtitle = `${bNo}`;
                    } else if (expense.reference_id) {
                      displaySubtitle = `${expense.reference_id}`;
                    } else {
                      displaySubtitle = "Stock Intake Batch";
                    }
                  }

                  // Date-only format (YYYY-MM-DD)
                  const dateOnly = expense.created_at ? expense.created_at.split(" ")[0] : "N/A";

                  return (
                    <TableRow key={expense.id}>
                      <TableCell style={{ fontSize: "13px", fontWeight: 500, color: theme.colors.onSurfaceVariant }}>
                        {dateOnly}
                      </TableCell>

                      <TableCell>
                        <div style={{ fontWeight: 600, fontSize: "14px", color: theme.colors.onSurface }}>
                          {displayTitle}
                        </div>
                        {displaySubtitle && (
                          <div style={{ fontSize: "12px", color: theme.colors.onSurfaceVariant, marginTop: "2px" }}>
                            {displaySubtitle}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            backgroundColor: badgeStyle.bg,
                            color: badgeStyle.color,
                            border: `1px solid ${badgeStyle.border}`,
                          }}
                        >
                          {expense.category}
                        </span>
                      </TableCell>

                      <TableCell style={{ fontSize: "13px", color: theme.colors.onSurface }}>
                        {expense.payment_method}
                      </TableCell>

                      <TableCell align="right" isNumeric style={{ fontWeight: 700, fontSize: "14px", color: theme.colors.error }}>
                        {formatCurrency(expense.amount)}
                      </TableCell>

                      <TableCell align="center">
                        <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDetailExpense(expense)}
                            title="View Full Details"
                            style={{ padding: "6px", height: "auto" }}
                          >
                            <Eye size={16} />
                          </Button>

                          {!isStock ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteTargetExpense(expense)}
                              title="Delete Record"
                              style={{ padding: "6px", height: "auto", borderColor: theme.colors.errorContainer, backgroundColor: theme.colors.errorContainer }}
                            >
                              <Trash2 size={16} color={theme.colors.error} />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              title="Stock purchase expenses are auto-linked to inventory intake batches and cannot be deleted directly."
                              style={{ padding: "6px", height: "auto", opacity: 0.4, cursor: "not-allowed" }}
                            >
                              <Trash2 size={16} color={theme.colors.disabledText} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Table Footer Pagination */}
          {!loading && expenses.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderTop: `1px solid ${theme.colors.disabledBorder}`,
                backgroundColor: theme.colors.surfaceContainerLow,
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
                Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, totalCount)} of {totalCount} expenses
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>

                <span style={{ fontSize: "13px", fontWeight: 600, color: theme.colors.onSurface, padding: "0 8px" }}>
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Modal 1: ADD EXPENSE MODAL */}
        <AddExpenseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onExpenseAdded={fetchExpenses}
        />

        {/* Modal 2: EXPENSE DETAILS MODAL */}
        <ExpenseDetailsModal
          expense={selectedDetailExpense}
          onClose={() => setSelectedDetailExpense(null)}
          formatCurrency={formatCurrency}
          getCategoryBadgeStyle={getCategoryBadgeStyle}
        />

        {/* Modal 3: DELETE EXPENSE MODAL */}
        <DeleteExpenseModal
          expense={deleteTargetExpense}
          onClose={() => setDeleteTargetExpense(null)}
          onConfirmDelete={handleDeleteConfirm}
          formatCurrency={formatCurrency}
        />
      </main>
    </div>
  );
}
