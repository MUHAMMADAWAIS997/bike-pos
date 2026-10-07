"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import { Button } from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import { ArrowLeft, Printer, Download, CheckCircle2 } from "lucide-react";
import { Watermark } from "@/components/common/watermark";

export interface ReceiptData {
  receipt_id: string;
  transaction_number: string;
  created_at: string;
  customer_name: string;
  customer_cnic: string;
  customer_mobile: string;
  customer_address: string;
  sale_id?: string;
  product_model?: string;
  chassis_no?: string;
  motor_no?: string;
  total_agreement_amount: number;
  down_payment: number;
  payment_amount: number;
  total_paid_to_date: number;
  remaining_balance: number;
  installment_months: number;
  monthly_installment: number;
  installments_paid_count: number;
  pending_installments_count: number;
  payment_type?: string;
  description: string;
  shop_name: string;
  shop_tagline: string;
  shop_address: string;
  shop_phone: string;
  brand_name: string;
  brand_tagline: string;
}

function ReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const receiptId = searchParams.get("id") || "";
  const { notify } = useNotification();

  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReceipt = useCallback(async () => {
    if (!receiptId) return;
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const shopSettings: any = await invoke("get_shop_settings").catch(() => null);

      // Fetch customer ledger entry by id
      const ledgerEntry: any = await invoke("get_customer_ledger_entry", { ledgerId: receiptId }).catch(async () => {
        return null;
      });

      if (ledgerEntry) {
        if (ledgerEntry.payment_type === "full") {
          const targetSaleId = ledgerEntry.sale_id || ledgerEntry.receipt_id || receiptId;
          router.replace(`/sales/details?id=${targetSaleId}`);
          return;
        }

        setReceipt({
          ...ledgerEntry,
          shop_name: shopSettings?.shop_name || "BKM MOTORS",
          shop_tagline: shopSettings?.tagline || "Deal in Environment Friendly Bikes",
          shop_address: shopSettings?.address || "Main Showroom, Motorway City, Pakistan",
          shop_phone: shopSettings?.phone || "0304-8799010",
          brand_name: shopSettings?.brand_name || "REVOO",
          brand_tagline: shopSettings?.brand_tagline || "ELECTRIC MOTORCYCLE BRAND",
        });
      } else {
        setReceipt({
          receipt_id: receiptId,
          transaction_number: `PAY-${receiptId.slice(-6)}`,
          created_at: new Date().toLocaleString(),
          customer_name: "Customer",
          customer_cnic: "N/A",
          customer_mobile: "N/A",
          customer_address: "N/A",
          total_agreement_amount: 0,
          down_payment: 0,
          payment_amount: 0,
          total_paid_to_date: 0,
          remaining_balance: 0,
          installment_months: 12,
          monthly_installment: 0,
          installments_paid_count: 0,
          pending_installments_count: 12,
          description: "Installment Payment",
          shop_name: shopSettings?.shop_name || "BKM MOTORS",
          shop_tagline: shopSettings?.tagline || "Deal in Environment Friendly Bikes",
          shop_address: shopSettings?.address || "Main Showroom, Motorway City, Pakistan",
          shop_phone: shopSettings?.phone || "0304-8799010",
          brand_name: shopSettings?.brand_name || "REVOO",
          brand_tagline: shopSettings?.brand_tagline || "ELECTRIC MOTORCYCLE BRAND",
        });
      }
    } catch (err: any) {
      console.error("Failed to load receipt details", err);
    } finally {
      setLoading(false);
    }
  }, [receiptId]);

  useEffect(() => {
    fetchReceipt();
  }, [fetchReceipt]);

  const handlePrintA4 = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleSaveNativeFile = async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const path: string = await invoke("export_native_report", {
        reportType: "sales",
        monthYear: null,
        fileFormat: "txt",
      });
      if (path) {
        notify(`Receipt document saved to: ${path}`, "success");
      }
    } catch (err: any) {
      if (!err?.toString()?.includes("cancelled")) {
        notify("Failed to save receipt.", "error");
      }
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading installment receipt...</div>;
  }

  const currentPaidCount = receipt?.installments_paid_count || 1;
  const totalMonths = receipt?.installment_months || 12;

  return (
    <div style={{ padding: "20px", maxWidth: "860px", margin: "0 auto" }}>
      {/* Top Action Bar (Hidden on print) */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <Button variant="outline" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft size={16} />}>
          Back to Ledger
        </Button>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="outline" size="sm" onClick={handleSaveNativeFile} leftIcon={<Download size={16} />}>
            Save File to Computer
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrintA4} leftIcon={<Printer size={16} />}>
            Print A4 Receipt
          </Button>
        </div>
      </div>

      {/* Printable A4 Container */}
      <div
        className="printable-invoice-container"
        style={{
          backgroundColor: "#ffffff",
          border: "2px solid #000000",
          borderRadius: "4px",
          padding: "32px 38px",
          color: "#000000",
          fontFamily: "Times New Roman, Georgia, serif",
          maxWidth: "800px",
          margin: "0 auto",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0, color: "#000000", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              {receipt?.shop_name || "BKM MOTORS"}
            </h1>
            <div style={{ fontSize: "13px", fontStyle: "italic", color: "#334155", marginTop: "2px" }}>
              {receipt?.shop_tagline || "Deal in Environment Friendly Bikes"}
            </div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
              📍 {receipt?.shop_address} | 📞 {receipt?.shop_phone}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <img
              src="/company_logo.png"
              alt="Company Logo"
              style={{
                height: "65px",
                maxWidth: "200px",
                objectFit: "contain",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
          </div>
        </div>

        {/* Title Banner */}
        <div style={{ backgroundColor: "#000000", color: "#ffffff", textAlign: "center", padding: "6px 0", fontSize: "14px", fontWeight: "800", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "18px" }}>
          OFFICIAL INSTALLMENT PAYMENT RECEIPT
        </div>

        {/* Customer & Receipt Metadata Box */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "12px 16px", border: "1px solid #000000", backgroundColor: "#f8fafc", marginBottom: "20px", fontSize: "13px" }}>
          <div>
            <div><strong>Customer Name:</strong> {receipt?.customer_name}</div>
            <div><strong>CNIC No:</strong> {receipt?.customer_cnic}</div>
            <div><strong>Mobile No:</strong> {receipt?.customer_mobile}</div>
            <div><strong>Address:</strong> {receipt?.customer_address}</div>
          </div>
          <div>
            <div><strong>Receipt No:</strong> {receipt?.transaction_number}</div>
            <div><strong>Date & Time:</strong> {receipt?.created_at}</div>
            <div><strong>Payment Mode:</strong> Installment Payment</div>
            {receipt?.product_model && <div><strong>E-Bike Model:</strong> {receipt?.product_model}</div>}
            {receipt?.chassis_no && receipt?.chassis_no !== "N/A" && <div><strong>Chassis No:</strong> {receipt?.chassis_no}</div>}
          </div>
        </div>

        {/* Payment & Installment Breakdown Summary Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#000000", color: "#ffffff" }}>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Description / Installment Particulars</th>
              <th style={{ padding: "8px 12px", textAlign: "right" }}>Amount (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1.5px solid #000000", backgroundColor: "#f0fdf4" }}>
              <td style={{ padding: "10px 12px", fontWeight: 800, color: "#166534" }}>
                Payment Received Today (This Receipt)
              </td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 900, fontSize: "17px", color: "#15803d" }}>
                Rs. {receipt?.payment_amount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
            </tr>

            {receipt?.total_agreement_amount ? (
              <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                <td style={{ padding: "8px 12px", color: "#334155" }}>
                  Total Agreement Contract Value
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>
                  Rs. {receipt?.total_agreement_amount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ) : null}

            {receipt?.down_payment ? (
              <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                <td style={{ padding: "8px 12px", color: "#334155" }}>
                  Down Payment Paid
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>
                  Rs. {receipt?.down_payment?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ) : null}

            {receipt?.monthly_installment ? (
              <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                <td style={{ padding: "8px 12px", color: "#334155" }}>
                  Monthly Installment Amount ({totalMonths}-Month Plan)
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>
                  Rs. {receipt?.monthly_installment?.toLocaleString("en-US", { minimumFractionDigits: 2 })} / mo
                </td>
              </tr>
            ) : null}

            <tr style={{ borderBottom: "1px solid #cbd5e1", backgroundColor: "#f8fafc" }}>
              <td style={{ padding: "8px 12px", fontWeight: 700, color: "#0f172a" }}>
                Installment Payment Progress
              </td>
              <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#0369a1" }}>
                {currentPaidCount} of {totalMonths} Installments Completed
              </td>
            </tr>

            <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
              <td style={{ padding: "8px 12px", color: "#334155" }}>
                Total Cumulative Amount Paid To Date
              </td>
              <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#15803d" }}>
                Rs. {receipt?.total_paid_to_date?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
            </tr>

            <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
              <td style={{ padding: "8px 12px", color: "#334155" }}>
                Remaining Pending Installments
              </td>
              <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#b45309" }}>
                {receipt?.pending_installments_count || 0} Month(s) Pending
              </td>
            </tr>

            <tr style={{ borderBottom: "2px solid #000000", backgroundColor: "#fff1f2" }}>
              <td style={{ padding: "10px 12px", fontWeight: 800, color: "#9f1239" }}>
                Remaining Outstanding Balance
              </td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 900, fontSize: "16px", color: (receipt?.remaining_balance || 0) > 0 ? "#dc2626" : "#15803d" }}>
                Rs. {receipt?.remaining_balance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Note / Terms */}
        <div style={{ fontSize: "11px", fontStyle: "italic", color: "#475569", marginBottom: "28px" }}>
          * Thank you for your payment. This receipt is computer-generated proof of installment payment received by {receipt?.shop_name}.
        </div>

        {/* Stamp & Authorized Signature Box */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "20px" }}>
          <div style={{ fontSize: "12px" }}>
            <span>Customer Signatures: ___________________</span>
          </div>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ borderTop: "1px solid #000000", width: "160px", paddingTop: "4px", fontSize: "12px", fontWeight: "700" }}>
              Authorized Signature
            </div>
          </div>
        </div>

        {/* Software Watermark */}
        <Watermark bold style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px dashed #cbd5e1" }} />
      </div>
    </div>
  );
}

export default function InstallmentReceiptPage() {
  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", padding: "16px 0" }}>
      <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading receipt...</div>}>
        <ReceiptContent />
      </Suspense>
    </div>
  );
}
