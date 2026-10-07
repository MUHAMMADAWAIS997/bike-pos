"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import {
  Button,
  Card,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Input,
} from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import { Watermark } from "@/components/common/watermark";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Receipt,
  Download,
  RefreshCw,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  Wallet,
  Coins,
  ShieldCheck,
  Building,
  RotateCcw,
  Edit3,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface LedgerItem {
  id: string;
  date: string;
  type: "inflow" | "outflow";
  category: string;
  reference: string;
  description: string;
  amount: number;
  payment_method: string;
}

export interface FinanceOverviewStats {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  total_receivables: number;
  markup_profit: number;
  incentives_earned: number;
}

const formatCurrency = (amount: number) => {
  return `Rs. ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function FinancePage() {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cashflow" | "partners">("cashflow");
  const [monthFilter, setMonthFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Bank Account Balance State
  const [initialBankBalance, setInitialBankBalance] = useState<number>(0);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankBalanceInput, setBankBalanceInput] = useState("");

  const [stats, setStats] = useState<FinanceOverviewStats>({
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0,
    total_receivables: 0,
    markup_profit: 0,
    incentives_earned: 0,
  });

  const [ledgers, setLedgers] = useState<LedgerItem[]>([]);
  const [partners, setPartners] = useState<any[]>([]);

  // Load initial bank balance on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bkm_bank_initial_balance");
      if (stored && !isNaN(Number(stored))) {
        setInitialBankBalance(Number(stored));
      }
    }
  }, []);

  const fetchFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");

      // 1. Fetch Revenue Summary for target month
      const revSummary: any = await invoke("get_revenue_summary", { monthYear: monthFilter }).catch(() => null);

      // 2. Fetch Expenses for target month
      const startDate = `${monthFilter}-01`;
      const endDate = `${monthFilter}-31`;
      const expRes: any = await invoke("get_expenses", {
        search: "",
        category: "all",
        startDate,
        endDate,
        orderBy: "newest",
        page: 1,
        perPage: 1000,
      }).catch(() => null);

      // 3. Fetch Partners Directory
      const partnerRes: any = await invoke("get_partners", {
        search: "",
        orderBy: "equity_desc",
        page: 1,
        perPage: 100,
      }).catch(() => null);

      setPartners(partnerRes?.partners || []);

      let totRev = 0;
      let totInitProfit = 0;
      let totMarkupFee = 0;
      let totIncentive = 0;
      let totNetProfit = 0;
      const ledgerList: LedgerItem[] = [];

      if (revSummary && revSummary.items) {
        revSummary.items.forEach((item: any) => {
          totRev += item.total_sales || 0;
          totInitProfit += item.initial_profit || 0;
          totMarkupFee += item.markup_fee_profit || 0;
          totIncentive += item.earned_incentive || 0;
          totNetProfit += item.total_profit || 0;

          ledgerList.push({
            id: `rev_${item.product_id}_${item.payment_type}`,
            date: monthFilter,
            type: "inflow",
            category: "Sales Revenue",
            reference: item.product_model,
            description: `${item.quantity_sold} Units Sold (${item.payment_type === "full" ? "Full Paid" : "Installment"})`,
            amount: item.total_sales,
            payment_method: item.payment_type === "full" ? "Cash/Bank" : "Installment Plan",
          });
        });
      }

      let totExp = 0;
      const expenseItems = expRes?.expenses || (Array.isArray(expRes) ? expRes : []);
      expenseItems.forEach((exp: any) => {
        totExp += exp.amount || 0;
        ledgerList.push({
          id: exp.id,
          date: exp.created_at ? exp.created_at.substring(0, 10) : monthFilter,
          type: "outflow",
          category: exp.category || "Expense",
          reference: exp.title || exp.recipient || "Store Expense",
          description: exp.description || exp.category,
          amount: exp.amount,
          payment_method: exp.payment_method || "Cash",
        });
      });

      // 4. Fetch Sales to calculate outstanding receivables
      const salesRes: any = await invoke("get_sales", {
        search: "",
        paymentType: "all",
        page: 1,
        perPage: 1000,
      }).catch(() => null);

      let totReceivables = 0;
      if (salesRes && salesRes.sales) {
        salesRes.sales.forEach((s: any) => {
          if (s.remaining_balance && s.remaining_balance > 0) {
            totReceivables += s.remaining_balance;
          }
        });
      }

      setStats({
        total_revenue: totRev,
        total_expenses: totExp,
        net_profit: totNetProfit - totExp,
        total_receivables: totReceivables,
        markup_profit: totMarkupFee,
        incentives_earned: totIncentive,
      });

      setLedgers(ledgerList);
    } catch (err: any) {
      console.error("Failed to load finance data:", err);
      notify("Failed to fetch finance records.", "error");
    } finally {
      setLoading(false);
    }
  }, [monthFilter, notify]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  // Current Effective Bank Account Balance Calculation
  const currentBankBalance = initialBankBalance + stats.total_revenue - stats.total_expenses;

  const handleSaveBankBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(bankBalanceInput);
    if (isNaN(val) || val < 0) {
      notify("Please enter a valid non-negative bank balance amount.", "warning");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("bkm_bank_initial_balance", val.toString());
    }
    setInitialBankBalance(val);
    setIsBankModalOpen(false);
    notify("Bank account initial balance updated & synced!", "success");
  };

  const filteredLedgers = ledgers.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.category.toLowerCase().includes(q) ||
      l.reference.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q)
    );
  });

  // Pagination calculations
  const totalItems = activeTab === "cashflow" ? filteredLedgers.length : partners.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedLedgers = filteredLedgers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedPartners = partners.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = () => {
    if (ledgers.length === 0) {
      notify("No financial transactions available to export.", "warning");
      return;
    }

    const headers = ["Date", "Type", "Category", "Reference", "Description", "Amount (Rs.)", "Payment Method"];
    const rows = filteredLedgers.map((l) => [
      l.date,
      l.type.toUpperCase(),
      `"${l.category}"`,
      `"${l.reference}"`,
      `"${l.description}"`,
      l.amount,
      `"${l.payment_method}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Finance_Ledger_Report_${monthFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Finance ledger CSV report downloaded.", "success");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />

      <main style={{ flex: 1, padding: theme.spacing.xl, overflowY: "auto" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Header Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: theme.rounded.md,
                  backgroundColor: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0284c7",
                }}
              >
                <Landmark size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: theme.colors.onSurface, margin: 0 }}>
                  Finance & Bank Account Management
                </h1>
                <p style={{ fontSize: "13.5px", color: theme.colors.onSurfaceVariant, margin: "2px 0 0 0" }}>
                  Sync in-app sales & expenses with your single bank account balance.
                </p>
              </div>
            </div>

            {/* Top Right Action Controls with Month Selection */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#f0f9ff",
                  border: "1.5px solid #bae6fd",
                  borderRadius: theme.rounded.md,
                  padding: "4px 10px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                }}
              >
                <Calendar size={15} color="#0c4a6e" />
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0c4a6e", whiteSpace: "nowrap" }}>
                  Month:
                </span>
                <input
                  type="month"
                  value={monthFilter}
                  onChange={(e) => {
                    setMonthFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    height: "28px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#0c4a6e",
                    fontWeight: 700,
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBankBalanceInput(initialBankBalance.toString());
                  setIsBankModalOpen(true);
                }}
                leftIcon={<Building size={15} />}
              >
                Set Bank Balance
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchFinanceData();
                  notify("Recalculated in-app totals and synced bank account balance!", "success", "Balance Recalculated");
                }}
                leftIcon={<RotateCcw size={15} className={loading ? "animate-spin" : ""} />}
              >
                Recalculate & Sync
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                leftIcon={<Download size={15} />}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* KPI Summary Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px" }}>
            {/* Bank Account Balance Card */}
            <Card style={{ backgroundColor: "#ecfeff", border: "1.5px solid #67e8f9", borderRadius: theme.rounded.lg, boxShadow: "0 4px 12px rgba(6, 182, 212, 0.08)" }}>
              <CardContent style={{ padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0e7490", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Bank Account Balance
                  </span>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#cffaff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building size={16} color="#0891b2" />
                  </div>
                </div>
                <div style={{ fontSize: "21px", fontWeight: 800, color: "#155e75" }}>
                  {formatCurrency(currentBankBalance)}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#0891b2", fontWeight: 600 }}>
                    Init: {formatCurrency(initialBankBalance)}
                  </span>
                  <button
                    onClick={() => {
                      setBankBalanceInput(initialBankBalance.toString());
                      setIsBankModalOpen(true);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0e7490",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    Edit Base
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue Card */}
            <Card style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: theme.rounded.lg }}>
              <CardContent style={{ padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Inflows (Revenue)
                  </span>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowUpRight size={16} color="#0284c7" />
                  </div>
                </div>
                <div style={{ fontSize: "21px", fontWeight: 800, color: "#0c4a6e" }}>
                  {formatCurrency(stats.total_revenue)}
                </div>
                <div style={{ fontSize: "11.5px", color: "#0284c7", marginTop: "4px" }}>
                  Sales & collections ({monthFilter})
                </div>
              </CardContent>
            </Card>

            {/* Total Expenses Card */}
            <Card style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: theme.rounded.lg }}>
              <CardContent style={{ padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#991b1b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Outflows (Expenses)
                  </span>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowDownRight size={16} color="#dc2626" />
                  </div>
                </div>
                <div style={{ fontSize: "21px", fontWeight: 800, color: "#7f1d1d" }}>
                  {formatCurrency(stats.total_expenses)}
                </div>
                <div style={{ fontSize: "11.5px", color: "#dc2626", marginTop: "4px" }}>
                  Stock & operational spend ({monthFilter})
                </div>
              </CardContent>
            </Card>

            {/* Net Store Profit Card */}
            <Card style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: theme.rounded.lg }}>
              <CardContent style={{ padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Net Store Profit
                  </span>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TrendingUp size={16} color="#16a34a" />
                  </div>
                </div>
                <div style={{ fontSize: "21px", fontWeight: 800, color: "#14532d" }}>
                  {formatCurrency(stats.net_profit)}
                </div>
                <div style={{ fontSize: "11.5px", color: "#16a34a", marginTop: "4px" }}>
                  Inflows minus outflows
                </div>
              </CardContent>
            </Card>

            {/* Pending Receivables Card */}
            <Card style={{ backgroundColor: "#fffbe6", border: "1px solid #ffe58f", borderRadius: theme.rounded.lg }}>
              <CardContent style={{ padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#873800", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Receivables
                  </span>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#fff1b8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Wallet size={16} color="#d46b08" />
                  </div>
                </div>
                <div style={{ fontSize: "21px", fontWeight: 800, color: "#612500" }}>
                  {formatCurrency(stats.total_receivables)}
                </div>
                <div style={{ fontSize: "11.5px", color: "#d46b08", marginTop: "4px" }}>
                  Pending installment balances
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Tabs & Search Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                variant={activeTab === "cashflow" ? "primary" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveTab("cashflow");
                  setCurrentPage(1);
                }}
                leftIcon={<Coins size={15} />}
              >
                Bank & Cash Ledger ({filteredLedgers.length})
              </Button>
              <Button
                variant={activeTab === "partners" ? "primary" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveTab("partners");
                  setCurrentPage(1);
                }}
                leftIcon={<PieChart size={15} />}
              >
                Partner Shares ({partners.length})
              </Button>
            </div>

            <div style={{ width: "260px" }}>
              <Input
                placeholder="Search financial records..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={<Search size={15} color={theme.colors.outline} />}
              />
            </div>
          </div>

          {/* Table Container */}
          <Card style={{ backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.rounded.lg, border: `1px solid ${theme.colors.outlineVariant}`, overflow: "hidden" }}>
            {activeTab === "cashflow" ? (
              <Table>
                <TableHeader>
                  <TableRow isHeader>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reference / Item</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead align="center">Payment Method</TableHead>
                    <TableHead align="right">Amount (Rs.)</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" style={{ padding: "40px 0" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                          <RefreshCw size={28} color={theme.colors.primary} className="animate-spin" />
                          <p style={{ margin: 0, color: theme.colors.onSurfaceVariant, fontSize: "14px" }}>Loading financial ledger records...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedLedgers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" style={{ padding: "48px 0" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <Receipt size={36} color={theme.colors.outline} />
                          <p style={{ margin: 0, fontWeight: 600, fontSize: "15px", color: theme.colors.onSurface }}>
                            No Financial Transactions Recorded
                          </p>
                          <p style={{ margin: 0, fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
                            Sales revenue inflows and expense outflows will automatically update bank statement totals here.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedLedgers.map((item, idx) => (
                      <TableRow key={`${item.id}_${idx}`}>
                        <TableCell>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "3px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              backgroundColor: item.type === "inflow" ? "#e0f2fe" : "#fee2e2",
                              color: item.type === "inflow" ? "#0369a1" : "#991b1b",
                              border: `1px solid ${item.type === "inflow" ? "#bae6fd" : "#fca5a5"}`,
                            }}
                          >
                            {item.type === "inflow" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                            {item.type.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell style={{ fontWeight: 600, color: theme.colors.onSurface }}>
                          {item.category}
                        </TableCell>
                        <TableCell style={{ color: theme.colors.onSurface }}>
                          {item.reference}
                        </TableCell>
                        <TableCell style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
                          {item.description}
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: "12px", color: theme.colors.outline }}>
                          {item.payment_method}
                        </TableCell>
                        <TableCell align="right" isNumeric style={{ fontWeight: 700, color: item.type === "inflow" ? "#16a34a" : "#dc2626" }}>
                          {item.type === "inflow" ? "+" : "-"}{formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow isHeader>
                    <TableHead>Partner Name</TableHead>
                    <TableHead align="center">CNIC / Mobile</TableHead>
                    <TableHead align="center">Equity Share (%)</TableHead>
                    <TableHead align="right">Estimated Net Profit Share</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" style={{ padding: "40px 0" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                          <RefreshCw size={28} color={theme.colors.primary} className="animate-spin" />
                          <p style={{ margin: 0, color: theme.colors.onSurfaceVariant, fontSize: "14px" }}>Loading partner equity records...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedPartners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" style={{ padding: "40px 0" }}>
                        <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant }}>
                          No partners registered in system. Add partners under Manage &gt; Partners.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPartners.map((p) => {
                      const shareAmt = (stats.net_profit * (p.equity_share || 0)) / 100;
                      return (
                        <TableRow key={p.id}>
                          <TableCell style={{ fontWeight: 700, color: theme.colors.onSurface }}>
                            {p.name}
                          </TableCell>
                          <TableCell align="center" style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
                            {p.cnic || "N/A"} &bull; {p.mobile || "N/A"}
                          </TableCell>
                          <TableCell align="center">
                            <span style={{ fontWeight: 800, color: "#0284c7", backgroundColor: "#e0f2fe", padding: "2px 8px", borderRadius: "10px", fontSize: "12px" }}>
                              {p.equity_share}%
                            </span>
                          </TableCell>
                          <TableCell align="right" isNumeric style={{ fontWeight: 700, color: "#16a34a" }}>
                            {formatCurrency(shareAmt)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}

            {/* Pagination Footer */}
            {totalItems > 0 && (
              <div
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#f8fafc",
                  borderTop: `1px solid ${theme.colors.outlineVariant}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant, fontWeight: 500 }}>
                  Showing <strong>{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</strong> to{" "}
                  <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong>{totalItems}</strong> records
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    leftIcon={<ChevronLeft size={15} />}
                  >
                    Previous
                  </Button>

                  <span style={{ fontSize: "13px", fontWeight: 700, color: theme.colors.onSurface, padding: "0 6px" }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    rightIcon={<ChevronRight size={15} />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Watermark bold style={{ marginTop: "16px" }} />
        </div>
      </main>

      {/* UPDATE BANK ACCOUNT INITIAL BALANCE MODAL */}
      {isBankModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#ffffff",
              borderRadius: theme.rounded.md,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #cbd5e1",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "18px 24px",
                backgroundColor: "#f0f9ff",
                borderBottom: "1px solid #bae6fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Building size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0c4a6e" }}>
                  Set / Update Bank Account Balance
                </h3>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveBankBalance} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <p style={{ margin: 0, fontSize: "13.5px", color: theme.colors.onSurfaceVariant, lineHeight: "1.5" }}>
                Enter your starting bank account balance. Sales revenue will automatically add to this balance, and expenses will deduct from it.
              </p>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: theme.colors.onSurface, marginBottom: "6px" }}>
                  STARTING BANK STATEMENT BALANCE (RS.) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1500000"
                  value={bankBalanceInput}
                  onChange={(e) => setBankBalanceInput(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {/* Modal Footer Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button variant="outline" type="button" onClick={() => setIsBankModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" leftIcon={<CheckCircle2 size={16} />}>
                  Save & Sync Balance
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
