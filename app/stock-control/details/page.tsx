"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import { Button, Card, CardContent } from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import {
  ArrowLeft, Printer, Download, ChevronLeft, ChevronRight,
  Boxes, Truck, Calendar, Layers, Package, DollarSign, Building2,
} from "lucide-react";
import { Watermark } from "@/components/common/watermark";
import { StockStatCards } from "@/components/stock/stock-stat-cards";

export interface StockBatchItemRow {
  id: string; batch_id: string; product_id: string;
  product_model: string; category: string;
  quantity: number; discount: number; retail_price: number; cost_price: number;
}
export interface StockBatchHeader {
  id: string; batch_no: string; supplier_company: string;
  total_items: number; total_quantity: number; total_value: number; created_at: string;
}

function StockBatchDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useNotification();
  const batchIdParam = searchParams.get("id") || searchParams.get("batch_id") || "";

  const [batch, setBatch] = useState<StockBatchHeader>({
    id: batchIdParam || "batch_101", batch_no: "BATCH-2026-001",
    supplier_company: "VoltMotors Supply Ltd", total_items: 3,
    total_quantity: 15, total_value: 450000, created_at: "2026-08-18 14:30:00",
  });
  const [items, setItems] = useState<StockBatchItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const fetchBatchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: any = await invoke("get_stock_batch_details", { batchId: batchIdParam || batch.id });
      if (res) {
        if (res.batch) setBatch(res.batch);
        if (res.items) setItems(res.items);
      }
    } catch (err: any) {
      console.error("Failed to fetch batch details", err);
      notify("Failed to load batch invoice details.", "error");
    } finally { setLoading(false); }
  }, [batchIdParam, batch.id, notify]);

  useEffect(() => { fetchBatchDetails(); }, [fetchBatchDetails]);

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    if (items.length === 0) { notify("No batch items to export.", "warning"); return; }
    const headers = ["Item #","Product Model","Category","Quantity","Discount %","Retail Price (PKR)","Cost Price (PKR)","Line Total (PKR)"];
    const csvRows = [headers.join(",")];
    items.forEach((item, index) => {
      const lineTotal = item.cost_price * item.quantity;
      csvRows.push([index + 1,`"${item.product_model.replace(/"/g,'""')}"`,`"${item.category.replace(/"/g,'""')}"`,item.quantity,item.discount,item.retail_price,item.cost_price,lineTotal].join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Batch_Invoice_${batch.batch_no}.csv`; a.click();
    URL.revokeObjectURL(url);
    notify("Batch invoice exported to CSV.", "success");
  };

  const fmt = (val: number) => `Rs. ${val.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / perPage) || 1;
  const paginatedItems = items.slice((currentPage - 1) * perPage, currentPage * perPage);
  const grandRetail = items.reduce((s, i) => s + i.retail_price * i.quantity, 0);
  const grandDiscount = items.reduce((s, i) => s + (i.retail_price * i.quantity * i.discount) / 100, 0);
  const grandCost = items.reduce((s, i) => s + i.cost_price * i.quantity, 0);
  const printedAt = new Date().toLocaleString("en-PK", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const batchStats = {
    currentCost: batch.total_value || grandCost,
    estimatedRevenue: grandRetail,
    totalQuantity: batch.total_quantity || items.reduce((s, i) => s + i.quantity, 0),
    estimatedProfit: grandRetail - (batch.total_value || grandCost),
    marginPercent: (batch.total_value || grandCost) > 0 ? ((grandRetail - (batch.total_value || grandCost)) / (batch.total_value || grandCost)) * 100 : 0,
    totalModels: batch.total_items || items.length,
  };

  const thStyle: React.CSSProperties = { padding: "11px 16px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: theme.colors.onSurfaceVariant, borderBottom: `2px solid ${theme.colors.outlineVariant}`, whiteSpace: "nowrap" };
  const tdBase: React.CSSProperties = { padding: "12px 16px", borderBottom: `1px solid ${theme.colors.surfaceContainer}` };

  return (
    <>
      {/* Print-only styles: hide everything except the print portal */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-invoice-portal {
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            z-index: 99999 !important;
            background: #fff !important;
          }
          @page { size: A4; margin: 10mm 14mm; }
          #print-invoice-portal * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        @media screen {
          #print-invoice-portal { display: none !important; }
        }
      `}</style>

      {/* ====== PRINT PORTAL (hidden on screen) ====== */}
      <div id="print-invoice-portal">
        <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: "12px", color: "#111", background: "#fff" }}>

          {/* Header */}
          <div style={{ background: "#00685f", color: "#fff", padding: "18px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, marginBottom: "2px" }}>BKM Motors</div>
              <div style={{ fontSize: "11px", opacity: 0.8 }}>E-Bike &amp; Motorcycle POS</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "17px", fontWeight: 800 }}>STOCK BATCH INVOICE</div>
              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "2px 10px", borderRadius: "4px", fontFamily: "monospace", fontSize: "13px", fontWeight: 700, marginTop: "4px" }}>
                {batch.batch_no}
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "2px solid #00685f", background: "#f4fffc" }}>
            {[{ label: "Supplier / Vendor", value: batch.supplier_company }, { label: "Intake Date", value: batch.created_at || "N/A" }, { label: "Printed On", value: printedAt }].map((m, i) => (
              <div key={i} style={{ padding: "12px 20px", borderRight: i < 2 ? "1px solid #bcc9c6" : "none" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00685f", marginBottom: "3px" }}>{m.label}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0b1c30" }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Summary boxes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", padding: "14px 20px", background: "#f8f9ff" }}>
            {[{ label: "Total Line Items", value: `${batch.total_items} Items`, color: "#0051d5" }, { label: "Total Units Delivered", value: `${batch.total_quantity} Units`, color: "#6d28d9" }, { label: "Batch Investment Cost", value: fmt(batch.total_value), color: "#00685f" }].map((s, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #bcc9c6", borderRadius: "6px", padding: "10px 14px" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", color: "#3d4947", marginBottom: "4px" }}>{s.label}</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Line items table */}
          <div style={{ padding: "0 20px 16px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#00685f", marginBottom: "8px", borderLeft: "3px solid #00685f", paddingLeft: "8px" }}>Line Items Detail</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ background: "#00685f", color: "#fff" }}>
                  {["#","Product Model","Category","Qty","Margin (PKR)","Retail Price","Unit Cost","Line Total"].map((h, i) => (
                    <th key={i} style={{ padding: "8px 10px", textAlign: i >= 3 ? "center" : "left", fontWeight: 700, fontSize: "9.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "#3d4947" }}>No items recorded.</td></tr>
                ) : items.map((item, index) => {
                  const lt = item.cost_price * item.quantity;
                  return (
                    <tr key={item.id} style={{ background: index % 2 === 0 ? "#fff" : "#f4fffc" }}>
                      <td style={{ padding: "7px 10px", color: "#3d4947", borderBottom: "1px solid #e5eeff" }}>{index + 1}</td>
                      <td style={{ padding: "7px 10px", fontWeight: 700, color: "#0b1c30", borderBottom: "1px solid #e5eeff" }}>{item.product_model}</td>
                      <td style={{ padding: "7px 10px", color: "#3d4947", borderBottom: "1px solid #e5eeff" }}>{item.category}</td>
                      <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 700, color: "#6d28d9", borderBottom: "1px solid #e5eeff" }}>{item.quantity}</td>
                      <td style={{ padding: "7px 10px", textAlign: "center", color: item.discount > 0 ? "#16a34a" : "#3d4947", borderBottom: "1px solid #e5eeff" }}>
                        {item.discount > 0 ? `Rs. ${item.discount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
                      </td>
                      <td style={{ padding: "7px 10px", textAlign: "right", color: "#0b1c30", borderBottom: "1px solid #e5eeff" }}>{fmt(item.retail_price)}</td>
                      <td style={{ padding: "7px 10px", textAlign: "right", color: "#0b1c30", borderBottom: "1px solid #e5eeff" }}>{fmt(item.cost_price)}</td>
                      <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 800, color: "#00685f", borderBottom: "1px solid #e5eeff" }}>{fmt(lt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <div style={{ minWidth: "300px", background: "#f4fffc", border: "1px solid #bcc9c6", borderRadius: "6px", overflow: "hidden" }}>
                {[{ label: "Gross Retail Value", value: fmt(grandRetail), highlight: false, red: false },
                  { label: "Total Discount Applied", value: `- ${fmt(grandDiscount)}`, highlight: false, red: true },
                  { label: "Net Batch Investment Cost", value: fmt(grandCost), highlight: true, red: false }].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", background: row.highlight ? "#00685f" : "transparent", color: row.highlight ? "#fff" : row.red ? "#ba1a1a" : "#0b1c30", fontWeight: row.highlight ? 800 : 500, fontSize: row.highlight ? "13px" : "11px", borderBottom: i < 2 ? "1px solid #bcc9c6" : "none" }}>
                    <span>{row.label}</span><span>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 20px 14px", borderTop: "2px solid #00685f", background: "#f8f9ff", fontSize: "9px", color: "#3d4947" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span>BKM Motors - Stock Procurement Invoice - {batch.batch_no}</span>
              <span>Computer-generated document. No signature required.</span>
            </div>
            <Watermark bold style={{ marginTop: "4px", color: "#000000" }} />
          </div>
        </div>
      </div>

      {/* ====== SCREEN UI ====== */}
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "24px", minWidth: 0, boxSizing: "border-box", overflowX: "hidden" }}>
          <Button variant="outline" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft size={16} />} style={{ marginBottom: "20px" }}>
            Back
          </Button>

          <Card style={{ backgroundColor: theme.colors.surfaceContainerLowest, border: `1px solid ${theme.colors.outlineVariant}`, borderRadius: theme.rounded.xl, overflow: "hidden", maxWidth: "960px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

            {/* Invoice header gradient */}
            <div style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryContainer} 100%)`, padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={26} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff", lineHeight: 1 }}>BKM Motors</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", marginTop: "3px" }}>E-Bike &amp; Motorcycle POS - Admin Portal</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Stock Batch Invoice</div>
                <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)", padding: "6px 16px", borderRadius: "8px", fontFamily: "monospace", fontSize: "18px", fontWeight: 800, color: "#fff", letterSpacing: "1px" }}>{batch.batch_no}</div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "14px" }}>
                  <button onClick={handleExportCSV}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}>
                    <Download size={14} /> Export CSV
                  </button>
                  <button onClick={handlePrint}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, background: "#fff", border: "none", color: theme.colors.primary, cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                    <Printer size={14} /> Print Invoice
                  </button>
                </div>
              </div>
            </div>

            {/* Meta strip */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${theme.colors.outlineVariant}`, background: theme.colors.surfaceContainerLow }}>
              {[{ icon: <Truck size={14} color={theme.colors.primary} />, label: "Supplier / Vendor", value: batch.supplier_company },
                { icon: <Calendar size={14} color={theme.colors.primary} />, label: "Intake Date & Time", value: batch.created_at || "N/A" }].map((m, i) => (
                <div key={i} style={{ padding: "14px 24px", borderRight: i === 0 ? `1px solid ${theme.colors.outlineVariant}` : "none", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ marginTop: "2px" }}>{m.icon}</div>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.colors.onSurfaceVariant, marginBottom: "3px" }}>{m.label}</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: theme.colors.onSurface }}>{m.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Multi-Variant KPI Stat Cards */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${theme.colors.outlineVariant}`, background: theme.colors.surfaceContainerLow }}>
              <StockStatCards stats={batchStats} compact />
            </div>

            {/* Table section header */}
            <div style={{ padding: "14px 24px 10px", display: "flex", alignItems: "center", gap: "10px", borderBottom: `1px solid ${theme.colors.outlineVariant}` }}>
              <div style={{ width: "3px", height: "18px", background: theme.colors.primary, borderRadius: "2px" }} />
              <span style={{ fontSize: "14px", fontWeight: 700, color: theme.colors.onSurface }}>Line Items Detail</span>
              {!loading && (
                <span style={{ background: theme.colors.primaryContainer, color: theme.colors.onPrimaryContainer, padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                  {items.length} items
                </span>
              )}
            </div>

            {/* Line items table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: theme.colors.surfaceContainerLow }}>
                    <th style={{ ...thStyle, textAlign: "left" }}>#</th>
                    <th style={{ ...thStyle, textAlign: "left" }}>Product Model &amp; Specs</th>
                    <th style={{ ...thStyle, textAlign: "left" }}>Category</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Qty (Units)</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Margin (PKR)</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Retail Price (PKR)</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Unit Cost (PKR)</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Line Total (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px 0" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: theme.colors.onSurfaceVariant }}>
                        <Boxes size={28} color={theme.colors.primary} />
                        <span style={{ fontSize: "14px" }}>Loading batch item details...</span>
                      </div>
                    </td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: "48px 0", color: theme.colors.onSurfaceVariant, fontSize: "14px" }}>No line items recorded for this batch.</td></tr>
                  ) : paginatedItems.map((item, index) => {
                    const lineTotal = item.cost_price * item.quantity;
                    const gi = (currentPage - 1) * perPage + index + 1;
                    return (
                      <tr key={item.id}
                        style={{ background: index % 2 === 0 ? "#fff" : theme.colors.surfaceContainerLowest }}
                        onMouseEnter={e => { e.currentTarget.style.background = theme.colors.surfaceContainerLow; }}
                        onMouseLeave={e => { e.currentTarget.style.background = index % 2 === 0 ? "#fff" : theme.colors.surfaceContainerLowest; }}>
                        <td style={{ ...tdBase, color: theme.colors.onSurfaceVariant, fontSize: "12px" }}>{gi}</td>
                        <td style={{ ...tdBase, fontWeight: 700, color: theme.colors.onSurface }}>{item.product_model}</td>
                        <td style={{ ...tdBase }}>
                          <span style={{ background: theme.colors.surfaceContainerHigh, padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: 600, color: theme.colors.onSurfaceVariant }}>{item.category}</span>
                        </td>
                        <td style={{ ...tdBase, textAlign: "center" }}>
                          <span style={{ fontWeight: 700, color: "#6d28d9", background: "#f3e8ff", padding: "2px 10px", borderRadius: "5px", fontSize: "12px" }}>{item.quantity} Units</span>
                        </td>
                        <td style={{ ...tdBase, textAlign: "center" }}>
                          {item.discount > 0
                            ? <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "12px" }}>Rs. {item.discount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            : <span style={{ color: theme.colors.onSurfaceVariant }}>-</span>}
                        </td>
                        <td style={{ ...tdBase, textAlign: "right", color: theme.colors.onSurface, fontSize: "12px" }}>{fmt(item.retail_price)}</td>
                        <td style={{ ...tdBase, textAlign: "right", color: theme.colors.onSurface, fontSize: "12px" }}>{fmt(item.cost_price)}</td>
                        <td style={{ ...tdBase, textAlign: "right" }}>
                          <span style={{ fontWeight: 800, fontSize: "13px", color: theme.colors.success }}>{fmt(lineTotal)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals block */}
            {!loading && items.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 24px", borderTop: `2px solid ${theme.colors.outlineVariant}`, background: theme.colors.surfaceContainerLow }}>
                <div style={{ minWidth: "360px", border: `1px solid ${theme.colors.outlineVariant}`, borderRadius: "10px", overflow: "hidden" }}>
                  {[
                    { label: "Gross Retail Value", value: fmt(grandRetail), highlight: false, red: false },
                    { label: "Total Discount Applied", value: `- ${fmt(grandDiscount)}`, highlight: false, red: true },
                    { label: "Net Batch Investment Cost", value: fmt(grandCost), highlight: true, red: false },
                  ].map((row, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: row.highlight ? theme.colors.primary : "#fff", color: row.highlight ? "#fff" : row.red ? theme.colors.error : theme.colors.onSurface, fontWeight: row.highlight ? 800 : 500, fontSize: row.highlight ? "15px" : "13px", borderBottom: i < 2 ? `1px solid ${theme.colors.outlineVariant}` : "none" }}>
                      <span>{row.label}</span><span>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalCount > perPage && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", borderTop: `1px solid ${theme.colors.outlineVariant}`, flexWrap: "wrap", gap: "12px" }}>
                <span style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant }}>
                  Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalCount)} of {totalCount} items
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} leftIcon={<ChevronLeft size={16} />}>Previous</Button>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: theme.colors.onSurface, padding: "0 8px" }}>Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} rightIcon={<ChevronRight size={16} />}>Next</Button>
                </div>
              </div>
            )}

            {/* Invoice footer */}
            <div style={{ padding: "12px 24px", background: theme.colors.surfaceContainerLow, borderTop: `1px solid ${theme.colors.outlineVariant}`, display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", color: theme.colors.onSurfaceVariant }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>BKM Motors - Stock Procurement Record - {batch.batch_no}</span>
                <span>Computer-generated document - No signature required</span>
              </div>
              <Watermark bold style={{ marginTop: "2px", color: theme.colors.onSurfaceVariant }} />
            </div>
          </Card>
        </main>
      </div>
    </>
  );
}

export default function StockBatchDetailsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Batch Invoice...</div>}>
      <StockBatchDetailsContent />
    </Suspense>
  );
}