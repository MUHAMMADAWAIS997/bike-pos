"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import {
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  CardContent,
} from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import {
  User,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Clock,
  Phone,
  FileText,
  MapPin,
  Printer,
  CreditCard,
  DollarSign,
} from "lucide-react";

export interface CustomerDetails {
  id: string;
  name: string;
  address: string;
  cnic: string;
  mobile: string;
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_cnic: string;
  customer_mobile: string;
  sale_id?: string;
  transaction_number: string;
  transaction_type: string;
  total_amount: number;
  paid_amount: number;
  remaining_balance: number;
  payment_type: string;
  installment_months: number;
  monthly_installment: number;
  installment_fee_type?: string;
  installment_fee_value?: number;
  installment_fee_amount?: number;
  description?: string;
  created_at: string;
}

export interface LedgerStats {
  total_purchases: number;
  total_paid: number;
  remaining_balance: number;
  total_entries: number;
}

function LedgerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("id") || "";
  const { notify } = useNotification();

  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [stats, setStats] = useState<LedgerStats>({
    total_purchases: 0,
    total_paid: 0,
    remaining_balance: 0,
    total_entries: 0,
  });
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Success Receipt Modal State
  const [lastPaymentReceiptId, setLastPaymentReceiptId] = useState<string | null>(null);

  const fetchLedgerData = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: any = await invoke("get_customer_ledger", { customerId });
      setCustomer(res.customer || null);
      setEntries(res.entries || []);
      setStats(res.stats || { total_purchases: 0, total_paid: 0, remaining_balance: 0, total_entries: 0 });
    } catch (err: any) {
      notify(err?.message || "Failed to load customer ledger.", "error");
    } finally {
      setLoading(false);
    }
  }, [customerId, notify]);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  const handleOpenPaymentModal = (saleId?: string, defaultMonthlyAmt?: number) => {
    setSelectedSaleId(saleId || "");
    if (defaultMonthlyAmt && defaultMonthlyAmt > 0) {
      setPaymentAmount(defaultMonthlyAmt.toString());
      setPaymentNote("Monthly Installment Payment");
    } else {
      setPaymentAmount("");
      setPaymentNote("");
    }
    setIsPaymentModalOpen(true);
  };

  const handleAddPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      notify("Please enter a valid payment amount greater than zero.", "warning");
      return;
    }

    setSubmittingPayment(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const newLedgerId: string = await invoke("add_customer_ledger_payment", {
        customerId,
        saleId: selectedSaleId || null,
        amount,
        description: paymentNote.trim() || "Installment Payment",
      });

      notify(`Payment of Rs. ${amount.toLocaleString()} recorded successfully!`, "success");
      setIsPaymentModalOpen(false);
      setPaymentAmount("");
      setPaymentNote("");
      setSelectedSaleId("");
      setLastPaymentReceiptId(newLedgerId);
      fetchLedgerData();
    } catch (err: any) {
      notify(err?.message || "Failed to record payment.", "error");
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: theme.spacing.lg,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.lg,
          overflowX: "hidden",
        }}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/customer")}
              leftIcon={<ArrowLeft size={16} />}
            >
              Back to Customers
            </Button>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: theme.colors.onSurface, margin: 0 }}>
                Customer Account Ledger
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
                Statement of sales, installment schedules, extra fee markups, and payment receipts.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => handleOpenPaymentModal()}
            leftIcon={<Plus size={16} />}
          >
            Record Payment
          </Button>
        </div>

        {/* Customer Information Card */}
        {customer && (
          <Card style={{ border: "1.5px solid #cbd5e1" }}>
            <CardContent
              style={{
                padding: "16px 20px",
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                gap: "16px",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.onPrimary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "16px",
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: theme.colors.onSurface }}>
                    {customer.name}
                  </div>
                  <div style={{ fontSize: "12px", color: theme.colors.onSurfaceVariant }}>
                    Customer ID: {customer.id}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: theme.colors.onSurface }}>
                <Phone size={15} color={theme.colors.primary} />
                <span>{customer.mobile}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: theme.colors.onSurface }}>
                <FileText size={15} color={theme.colors.primary} />
                <span>CNIC: {customer.cnic}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: theme.colors.onSurface }}>
                <MapPin size={15} color={theme.colors.primary} />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {customer.address}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Financial Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {/* Card 1: Total Purchases (Blue Scheme) */}
          <Card style={{ backgroundColor: theme.cardSchemes.blue.background, border: `1px solid ${theme.cardSchemes.blue.border}`, borderRadius: theme.rounded.xl }}>
            <CardContent style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: theme.cardSchemes.blue.titleText, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Total Purchases
                </span>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: theme.cardSchemes.blue.badgeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CreditCard size={18} color={theme.cardSchemes.blue.accent} />
                </div>
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: theme.cardSchemes.blue.titleText }}>
                Rs. {stats.total_purchases.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Total Amount Paid (Emerald Scheme) */}
          <Card style={{ backgroundColor: theme.cardSchemes.emerald.background, border: `1px solid ${theme.cardSchemes.emerald.border}`, borderRadius: theme.rounded.xl }}>
            <CardContent style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: theme.cardSchemes.emerald.titleText, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Total Amount Paid
                </span>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: theme.cardSchemes.emerald.badgeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign size={18} color={theme.cardSchemes.emerald.accent} />
                </div>
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: theme.cardSchemes.emerald.accent }}>
                Rs. {stats.total_paid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Outstanding Balance (Rose/Emerald Scheme) */}
          <Card style={{ backgroundColor: stats.remaining_balance > 0 ? theme.cardSchemes.rose.background : theme.cardSchemes.emerald.background, border: `1px solid ${stats.remaining_balance > 0 ? theme.cardSchemes.rose.border : theme.cardSchemes.emerald.border}`, borderRadius: theme.rounded.xl }}>
            <CardContent style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: stats.remaining_balance > 0 ? theme.cardSchemes.rose.titleText : theme.cardSchemes.emerald.titleText, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Outstanding Balance
                </span>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: stats.remaining_balance > 0 ? theme.cardSchemes.rose.badgeBg : theme.cardSchemes.emerald.badgeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={18} color={stats.remaining_balance > 0 ? theme.cardSchemes.rose.accent : theme.cardSchemes.emerald.accent} />
                </div>
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: stats.remaining_balance > 0 ? theme.cardSchemes.rose.accent : theme.cardSchemes.emerald.accent }}>
                Rs. {stats.remaining_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Ledger Entries (Purple Scheme) */}
          <Card style={{ backgroundColor: theme.cardSchemes.purple.background, border: `1px solid ${theme.cardSchemes.purple.border}`, borderRadius: theme.rounded.xl }}>
            <CardContent style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: theme.cardSchemes.purple.titleText, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Ledger Entries
                </span>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: theme.cardSchemes.purple.badgeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={18} color={theme.cardSchemes.purple.accent} />
                </div>
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: theme.cardSchemes.purple.titleText }}>
                {stats.total_entries}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Ledger Table */}
        <Card style={{ padding: 0, overflow: "hidden", border: "1.5px solid #cbd5e1" }}>
          <div style={{ width: "100%", overflowX: "auto" }}>
            {loading ? (
              <div style={{ padding: "60px 0", textAlign: "center", color: theme.colors.onSurfaceVariant }}>
                Loading ledger statement...
              </div>
            ) : entries.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: theme.colors.onSurfaceVariant }}>
                No ledger transactions recorded for this customer yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow isHeader style={{ backgroundColor: "#f8fafc" }}>
                    <TableHead>#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Method / Plan</TableHead>
                    <TableHead align="right">Agreement Total</TableHead>
                    <TableHead align="right">Paid Amount</TableHead>
                    <TableHead align="right">Balance</TableHead>
                    <TableHead align="center">Status</TableHead>
                    <TableHead align="center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((item, index) => {
                    const isPayment = item.transaction_type === "installment_payment";
                    const isInstallment = item.payment_type === "installment";
                    const dateOnly = item.created_at ? item.created_at.split(" ")[0] : "";
                    const feeAmt = item.installment_fee_amount || 0;

                    return (
                      <TableRow key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <TableCell isNumeric style={{ color: theme.colors.onSurfaceVariant }}>
                          {index + 1}
                        </TableCell>

                        {/* Date */}
                        <TableCell style={{ fontSize: "13px", fontWeight: 600, color: theme.colors.onSurface }}>
                          {dateOnly}
                        </TableCell>

                        {/* Payment Method / Plan Badge */}
                        <TableCell>
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <div
                              style={{
                                display: "inline-flex",
                                padding: "3px 10px",
                                borderRadius: "12px",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                width: "fit-content",
                                backgroundColor: isPayment
                                  ? "#e0f2fe"
                                  : isInstallment
                                  ? "#fef3c7"
                                  : "#dcfce7",
                                color: isPayment
                                  ? "#0369a1"
                                  : isInstallment
                                  ? "#b45309"
                                  : "#15803d",
                              }}
                            >
                              {isPayment
                                ? "Payment Received"
                                : isInstallment
                                ? `INSTALLMENT PLAN (${item.installment_months} Mos)`
                                : "PAID IN FULL"}
                            </div>

                            {isInstallment && (
                              <div style={{ fontSize: "11px", color: theme.colors.onSurfaceVariant }}>
                                Rs. {item.monthly_installment?.toLocaleString()}/mo
                                {feeAmt > 0 && (
                                  <span style={{ color: theme.colors.primary, fontWeight: 700, marginLeft: "4px" }}>
                                    (+ Rs. {feeAmt.toLocaleString()} Fee)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Agreement Total */}
                        <TableCell align="right" style={{ fontWeight: 700, color: theme.colors.onSurface }}>
                          Rs. {item.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>

                        {/* Paid Amount */}
                        <TableCell align="right" style={{ fontWeight: 700, color: "#16a34a" }}>
                          Rs. {item.paid_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>

                        {/* Balance */}
                        <TableCell align="right" style={{ fontWeight: 700, color: item.remaining_balance > 0 ? "#dc2626" : "#16a34a" }}>
                          Rs. {item.remaining_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>

                        {/* Status */}
                        <TableCell align="center">
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              color: item.remaining_balance <= 0 ? "#16a34a" : "#d97706",
                            }}
                          >
                            {item.remaining_balance <= 0 ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                            <span>{item.remaining_balance <= 0 ? "Paid in Full" : "Balance Due"}</span>
                          </div>
                        </TableCell>

                        {/* Action Buttons */}
                        <TableCell align="center">
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                            {isInstallment && item.remaining_balance > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenPaymentModal(item.sale_id || item.id, item.monthly_installment)}
                                leftIcon={<Plus size={13} />}
                              >
                                Pay Installment
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (item.payment_type === "full" || (item.sale_id && item.payment_type === "full")) {
                                  const targetSaleId = item.sale_id || item.id;
                                  router.push(`/sales/details?id=${targetSaleId}`);
                                } else {
                                  router.push(`/customer/receipt?id=${item.id}`);
                                }
                              }}
                              leftIcon={<Printer size={13} />}
                            >
                              Receipt
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        {/* Record Payment Modal */}
        {isPaymentModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(11, 28, 48, 0.4)",
              backdropFilter: "blur(2px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={() => setIsPaymentModalOpen(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "440px",
                backgroundColor: theme.colors.surfaceContainerLowest,
                border: "1.5px solid #cbd5e1",
                borderRadius: theme.rounded.lg,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: theme.colors.onSurface }}>
                Record Customer Installment Payment
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
                Customer: <strong>{customer?.name}</strong> | Current Outstanding Balance:{" "}
                <strong style={{ color: "#dc2626" }}>
                  Rs. {stats.remaining_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </strong>
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                    Payment Amount (Rs.)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter payment amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                    Payment Description / Reference
                  </label>
                  <Input
                    placeholder="e.g. Month 3 Installment Payment"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={submittingPayment || !paymentAmount}
                  onClick={handleAddPayment}
                >
                  {submittingPayment ? "Processing..." : "Confirm & Save Payment"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal to Print Receipt */}
        {lastPaymentReceiptId && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(11, 28, 48, 0.5)",
              backdropFilter: "blur(3px)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                backgroundColor: "#ffffff",
                borderRadius: theme.rounded.xl,
                padding: "28px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              }}
            >
              <CheckCircle2 size={48} color={theme.colors.success} style={{ margin: "0 auto" }} />
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: theme.colors.onSurface }}>
                  Payment Recorded Successfully!
                </h3>
                <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
                  You can now print an A4 proof receipt or save the receipt document to your computer.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <Button
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={() => setLastPaymentReceiptId(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  style={{ flex: 1.2 }}
                  onClick={() => {
                    const rid = lastPaymentReceiptId;
                    setLastPaymentReceiptId(null);
                    router.push(`/customer/receipt?id=${rid}`);
                  }}
                  leftIcon={<Printer size={16} />}
                >
                  Print A4 Receipt
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CustomerLedgerPage() {
  return (
    <Suspense fallback={<div>Loading customer ledger...</div>}>
      <LedgerContent />
    </Suspense>
  );
}
