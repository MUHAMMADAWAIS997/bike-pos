"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import { Button, Card } from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import { Watermark } from "@/components/common/watermark";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  User,
  Phone,
  FileText,
  MapPin,
  CreditCard,
  ShoppingBag,
  Receipt,
} from "lucide-react";

export interface SaleDetailHeader {
  id: string;
  transaction_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_cnic: string | null;
  customer_mobile: string | null;
  customer_address: string | null;
  chassis_no: string | null;
  motor_no: string | null;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  remaining_balance: number;
  payment_type: "full" | "installment";
  installment_months: number;
  monthly_installment: number;
  installment_fee_type?: string;
  installment_fee_value?: number;
  installment_fee_amount?: number;
  status: string;
  created_at: string;
}

export interface SaleItemDetail {
  id: string;
  sale_id: string;
  product_id: string;
  product_model: string;
  category: string | null;
  color: string | null;
  battery_type: string | null;
  volt: string | null;
  manufacturing_year: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ShopSettingsData {
  id: string;
  shop_name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  brand_name: string;
  brand_tagline: string;
  default_printer?: string;
  auto_show_receipt?: boolean;
  silent_printing?: boolean;
  updated_at: string;
}

function SaleDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saleId = searchParams.get("id");
  const { notify } = useNotification();

  const [sale, setSale] = useState<SaleDetailHeader | null>(null);
  const [items, setItems] = useState<SaleItemDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const [shopSettings, setShopSettings] = useState<ShopSettingsData>({
    id: "default",
    shop_name: "BKM MOTORS",
    tagline: "Deal in Environment Friendly Bikes",
    address: "Main Showroom, Motorway City, Pakistan",
    phone: "0304-8799010",
    email: "info@bkmmotors.com",
    brand_name: "REVOO",
    brand_tagline: "ELECTRIC MOTORCYCLE BRAND",
    updated_at: "",
  });

  const fetchSaleDetails = useCallback(async () => {
    if (!saleId) return;
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: { sale: SaleDetailHeader; items: SaleItemDetail[] } =
        await invoke("get_sale_details", { saleId });
      setSale(res.sale);
      setItems(res.items || []);

      // Load shop settings
      const settings = (await invoke("get_shop_settings").catch(() => null)) as ShopSettingsData | null;
      if (settings) {
        setShopSettings(settings);
      }
    } catch (err: any) {
      notify(err?.message || "Failed to load sale record details.", "error");
    } finally {
      setLoading(false);
    }
  }, [saleId, notify]);

  useEffect(() => {
    fetchSaleDetails();
  }, [fetchSaleDetails]);

  // Auto-trigger printing if autoPrint query param is present from checkout completion
  useEffect(() => {
    if (!loading && sale) {
      const autoPrint = searchParams.get("autoPrint") === "true";

      if (autoPrint) {
        const timer = setTimeout(() => {
          handleNativePrint();
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, sale, searchParams]);

  const handleNativePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: theme.colors.onSurfaceVariant }}>
        Loading sale record details...
      </div>
    );
  }

  if (!sale) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>Sale Record Not Found</h2>
        <Button variant="outline" onClick={() => router.push("/sales")}>
          Back to Sales Records
        </Button>
      </div>
    );
  }

  const isInstallment = sale.payment_type === "installment";
  const mainProduct = items[0] || {
    product_model: "Electric Bike",
    color: "Standard",
    category: "Standard",
    quantity: 1,
    unit_price: sale.total_amount,
    total_price: sale.total_amount,
  };

  const isEbikeSale = Boolean(
    (sale.chassis_no && sale.chassis_no !== "N/A") ||
      (sale.motor_no && sale.motor_no !== "N/A") ||
      items.some((item) => {
        const cat = (item.category || "").toLowerCase();
        return cat === "e-bike" || cat === "ebike";
      })
  );

  return (
    <div>
      {/* CSS Styles to handle Native Desktop Printing (window.print()) cleanly */}
      <style jsx global>{`
        @media print {
          aside,
          nav,
          .no-print,
          button {
            display: none !important;
          }
          body,
          main {
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .printable-invoice-container {
            width: 100% !important;
            max-width: 800px !important;
            margin: 0 auto !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            font-size: 13px !important;
            color: #000000 !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
        }
      `}</style>

      {/* Screen Navigation Header Bar (Hidden during desktop native printing) */}
      <div
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/sales")}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Sales
          </Button>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: theme.colors.onSurface,
              margin: 0,
            }}
          >
            Sales Invoice Preview
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {sale.customer_id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/customer/ledger?id=${sale.customer_id}`)}
              leftIcon={<Receipt size={15} />}
            >
              Customer Ledger
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleNativePrint}
            leftIcon={<Printer size={16} />}
          >
            Print Sales Invoice
          </Button>
        </div>
      </div>

      {/* OFFICIAL BKM MOTORS PHYSICAL SALES INVOICE LAYOUT */}
      <div
        className="printable-invoice-container"
        style={{
          backgroundColor: "#ffffff",
          border: "1.5px solid #000000",
          borderRadius: "4px",
          padding: "24px 30px",
          color: "#000000",
          fontFamily: "Times New Roman, Georgia, serif",
          maxWidth: "850px",
          margin: "0 auto",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Invoice Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "8px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "900",
                margin: 0,
                color: "#000000",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              {shopSettings.shop_name || "BKM MOTORS"}
            </h1>
            <div
              style={{
                fontSize: "13px",
                fontStyle: "italic",
                color: "#1e293b",
                marginTop: "2px",
              }}
            >
              {shopSettings.tagline || "Deal in Environment Friendly Bikes"}
            </div>
          </div>

          {/* Brand Logo Header Image */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <img
              src="/company_logo.png"
              alt={shopSettings.brand_name || "Company Logo"}
              style={{
                height: "65px",
                maxWidth: "200px",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        {/* Black Banner: SALES INVOICE */}
        <div
          style={{
            backgroundColor: "#000000",
            color: "#ffffff",
            textAlign: "center",
            padding: "5px 0",
            fontSize: "14px",
            fontWeight: "800",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          SALES INVOICE
        </div>

        {/* Company Contact Details Line */}
        <div
          style={{
            textAlign: "center",
            fontSize: "11px",
            lineHeight: "1.4",
            color: "#000000",
            marginBottom: "14px",
            borderBottom: "1px solid #000000",
            paddingBottom: "6px",
          }}
        >
          <div>Hafizabad Road, Katchi Chowk, Opposite Total Pump, Qila Didar Singh.</div>
          <div>
            Tel: 0302-9889968, 0320-1683100 &nbsp;|&nbsp; Email: bkmmotors.ev@gmail.com &nbsp;|&nbsp; Website: www.revoo-ev.com.pk
          </div>
        </div>

        {/* Customer & Transaction Meta Lines */}
        {isEbikeSale ? (
          /* Full Customer Info for E-Bikes */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "13.5px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <span>Invoice #:</span>
                <strong style={{ borderBottom: "1px dotted #000", minWidth: "180px" }}>
                  {sale.transaction_number || sale.id}
                </strong>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <span>Date:</span>
                <strong style={{ borderBottom: "1px dotted #000", minWidth: "120px" }}>
                  {sale.created_at ? sale.created_at.split(" ")[0] : ""}
                </strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <span style={{ minWidth: "60px" }}>Name:</span>
              <strong style={{ borderBottom: "1px dotted #000", flex: 1 }}>
                {sale.customer_name}
              </strong>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <span style={{ minWidth: "60px" }}>Address:</span>
              <strong style={{ borderBottom: "1px dotted #000", flex: 1 }}>
                {sale.customer_address || "N/A"}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "6px", flex: 1 }}>
                <span style={{ minWidth: "60px" }}>Phone:</span>
                <strong style={{ borderBottom: "1px dotted #000", minWidth: "220px" }}>
                  {sale.customer_mobile || "N/A"}
                </strong>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <span>N.I.C. #:</span>
                <strong style={{ borderBottom: "1px dotted #000", minWidth: "200px" }}>
                  {sale.customer_cnic || "N/A"}
                </strong>
              </div>
            </div>
          </div>
        ) : (
          /* Simplified Customer Info for Non-E-Bikes (Name & Phone ONLY) */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "13.5px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <span>Invoice #:</span>
                <strong style={{ borderBottom: "1px dotted #000", minWidth: "180px" }}>
                  {sale.transaction_number || sale.id}
                </strong>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <span>Date:</span>
                <strong style={{ borderBottom: "1px dotted #000", minWidth: "120px" }}>
                  {sale.created_at ? sale.created_at.split(" ")[0] : ""}
                </strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ display: "flex", gap: "6px", flex: 1 }}>
                <span style={{ minWidth: "60px" }}>Name:</span>
                <strong style={{ borderBottom: "1px dotted #000", flex: 1 }}>
                  {sale.customer_name}
                </strong>
              </div>

              <div style={{ display: "flex", gap: "6px", minWidth: "250px" }}>
                <span>Phone:</span>
                <strong style={{ borderBottom: "1px dotted #000", flex: 1 }}>
                  {sale.customer_mobile || "N/A"}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Items Table */}
        {isEbikeSale ? (
          /* E-Bike Specifications Table */
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1.5px solid #000000",
              fontSize: "12.5px",
              marginBottom: "16px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9", textAlign: "center" }}>
                <th style={{ border: "1px solid #000000", padding: "6px 4px", width: "45px" }}>Qty</th>
                <th style={{ border: "1px solid #000000", padding: "6px 8px", textAlign: "left" }}>DESCRIPTION</th>
                <th style={{ border: "1px solid #000000", padding: "6px 4px", width: "85px", fontSize: "10.5px" }}>
                  Value Excluding Sales Tax
                </th>
                <th style={{ border: "1px solid #000000", padding: "6px 4px", width: "70px", fontSize: "10.5px" }}>
                  Rate of Sales tax %
                </th>
                <th style={{ border: "1px solid #000000", padding: "6px 4px", width: "75px", fontSize: "10.5px" }}>
                  Sales tax Payable
                </th>
                <th style={{ border: "1px solid #000000", padding: "6px 8px", width: "130px", fontSize: "11px" }}>
                  Total Value Including Sales Tax
                </th>
              </tr>
            </thead>
            <tbody>
              {(items.length > 0 ? items : [mainProduct]).map((item, idx) => (
                <tr key={item.id || idx}>
                  <td style={{ border: "1px solid #000000", padding: "10px 4px", textAlign: "center", verticalAlign: "top", fontWeight: "700" }}>
                    {item.quantity}
                  </td>

                  <td style={{ border: "1px solid #000000", padding: "10px 12px", verticalAlign: "top" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div>
                        <span style={{ color: "#475569" }}>Model:</span>{" "}
                        <strong style={{ fontSize: "14px" }}>{item.product_model}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#475569" }}>Color:</span>{" "}
                        <strong>{item.color && item.color !== "N/A" ? item.color : "N/A"}</strong>
                      </div>
                      {idx === 0 && (
                        <>
                          <div>
                            <span style={{ color: "#475569" }}>Chassis No:</span>{" "}
                            <strong style={{ fontFamily: "monospace" }}>{sale.chassis_no || "N/A"}</strong>
                          </div>
                          <div>
                            <span style={{ color: "#475569" }}>Motor No:</span>{" "}
                            <strong style={{ fontFamily: "monospace" }}>{sale.motor_no || "N/A"}</strong>
                          </div>
                        </>
                      )}
                      <div>
                        <span style={{ color: "#475569" }}>Battery Type:</span>{" "}
                        <strong>{item.battery_type && item.battery_type !== "N/A" ? item.battery_type : "N/A"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#475569" }}>Volt:</span>{" "}
                        <strong>{item.volt && item.volt !== "N/A" ? item.volt : "N/A"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#475569" }}>Manufacturing Year:</span>{" "}
                        <strong>{item.manufacturing_year && item.manufacturing_year !== "N/A" ? item.manufacturing_year : "N/A"}</strong>
                      </div>
                    </div>
                  </td>

                  <td style={{ border: "1px solid #000000", padding: "10px 4px", textAlign: "center", verticalAlign: "top" }}>-</td>
                  <td style={{ border: "1px solid #000000", padding: "10px 4px", textAlign: "center", verticalAlign: "top" }}>-</td>
                  <td style={{ border: "1px solid #000000", padding: "10px 4px", textAlign: "center", verticalAlign: "top" }}>-</td>

                  <td style={{ border: "1px solid #000000", padding: "10px 10px", textAlign: "right", verticalAlign: "top", fontSize: "16px", fontWeight: "800" }}>
                    {item.total_price.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}

              {sale.payment_type === "installment" && (sale.installment_fee_amount || 0) > 0 && (
                <tr style={{ backgroundColor: "#fafafa" }}>
                  <td colSpan={5} style={{ border: "1px solid #000000", padding: "6px 12px", textAlign: "right", fontWeight: "600", fontSize: "12px", color: "#475569" }}>
                    Installment Extra Charge ({sale.installment_fee_type === "percentage" ? `${sale.installment_fee_value}% Markup` : "Fixed Fee"})
                  </td>
                  <td style={{ border: "1px solid #000000", padding: "6px 10px", textAlign: "right", fontWeight: "700", fontSize: "13.5px" }}>
                    + {sale.installment_fee_amount?.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                  </td>
                </tr>
              )}

              <tr style={{ backgroundColor: "#f8fafc" }}>
                <td
                  colSpan={5}
                  style={{
                    border: "1px solid #000000",
                    padding: "8px 12px",
                    textAlign: "right",
                    fontWeight: "800",
                    fontSize: "13.5px",
                  }}
                >
                  Total Agreement Payable Amount
                </td>
                <td
                  style={{
                    border: "1px solid #000000",
                    padding: "8px 10px",
                    textAlign: "right",
                    fontWeight: "900",
                    fontSize: "17px",
                  }}
                >
                  {sale.total_amount.toLocaleString("en-US", { minimumFractionDigits: 0 })} /-
                </td>
              </tr>

              {sale.payment_type === "installment" && (
                <tr style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>
                  <td colSpan={5} style={{ border: "1px solid #000000", padding: "6px 12px", textAlign: "right", fontWeight: "700", fontSize: "12px" }}>
                    Installment Schedule ({sale.installment_months} Months Plan)
                  </td>
                  <td style={{ border: "1px solid #000000", padding: "6px 10px", textAlign: "right", fontWeight: "800", fontSize: "13.5px" }}>
                    Rs. {sale.monthly_installment?.toLocaleString("en-US", { minimumFractionDigits: 2 })} / mo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          /* Non-E-Bike Products Table */
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1.5px solid #000000",
              fontSize: "12.5px",
              marginBottom: "16px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9", textAlign: "center" }}>
                <th style={{ border: "1px solid #000000", padding: "8px 4px", width: "40px" }}>#</th>
                <th style={{ border: "1px solid #000000", padding: "8px 12px", textAlign: "left" }}>
                  ITEM / PRODUCT DETAILS
                </th>
                <th style={{ border: "1px solid #000000", padding: "8px 4px", width: "60px" }}>QTY</th>
                <th style={{ border: "1px solid #000000", padding: "8px 10px", width: "130px", textAlign: "right" }}>
                  PRICE (Rs.)
                </th>
                <th style={{ border: "1px solid #000000", padding: "8px 10px", width: "140px", textAlign: "right" }}>
                  TOTAL (Rs.)
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td style={{ border: "1px solid #000000", padding: "10px 4px", textAlign: "center", fontWeight: "700" }}>
                    {idx + 1}
                  </td>
                  <td style={{ border: "1px solid #000000", padding: "10px 12px" }}>
                    <div style={{ fontWeight: "700", fontSize: "14px" }}>{item.product_model}</div>
                    {item.category && item.category !== "N/A" && (
                      <div style={{ fontSize: "11.5px", color: "#475569" }}>Category: {item.category}</div>
                    )}
                    {item.color && item.color !== "N/A" && (
                      <div style={{ fontSize: "11.5px", color: "#475569" }}>Details: {item.color}</div>
                    )}
                  </td>
                  <td style={{ border: "1px solid #000000", padding: "10px 4px", textAlign: "center", fontWeight: "700", fontSize: "14px" }}>
                    {item.quantity}
                  </td>
                  <td style={{ border: "1px solid #000000", padding: "10px 10px", textAlign: "right" }}>
                    {item.unit_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: "1px solid #000000", padding: "10px 10px", textAlign: "right", fontWeight: "700", fontSize: "14px" }}>
                    {item.total_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}

              {sale.discount_amount > 0 && (
                <tr>
                  <td colSpan={4} style={{ border: "1px solid #000000", padding: "6px 12px", textAlign: "right", fontWeight: "600" }}>
                    Subtotal
                  </td>
                  <td style={{ border: "1px solid #000000", padding: "6px 10px", textAlign: "right", fontWeight: "600" }}>
                    {sale.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )}

              {sale.discount_amount > 0 && (
                <tr>
                  <td colSpan={4} style={{ border: "1px solid #000000", padding: "6px 12px", textAlign: "right", fontWeight: "600", color: "#dc2626" }}>
                    Discount
                  </td>
                  <td style={{ border: "1px solid #000000", padding: "6px 10px", textAlign: "right", fontWeight: "600", color: "#dc2626" }}>
                    - {sale.discount_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )}

              <tr style={{ backgroundColor: "#f8fafc" }}>
                <td
                  colSpan={4}
                  style={{
                    border: "1px solid #000000",
                    padding: "8px 12px",
                    textAlign: "right",
                    fontWeight: "800",
                    fontSize: "13.5px",
                  }}
                >
                  Grand Total Amount
                </td>
                <td
                  style={{
                    border: "1px solid #000000",
                    padding: "8px 10px",
                    textAlign: "right",
                    fontWeight: "900",
                    fontSize: "17px",
                  }}
                >
                  {sale.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} /-
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Note Disclaimer Section */}
        <div style={{ fontSize: "11.5px", lineHeight: "1.5", marginBottom: "36px" }}>
          <strong>Note:</strong>
          <div style={{ paddingLeft: "10px", marginTop: "2px" }}>
            <div>• Costomers are requested to thoroughly inspect the vehicle before purchasing.</div>
            <div>• Warranty is subject to the company's terms and conditions.</div>
          </div>
        </div>

        {/* Signatures & Stamps Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingTop: "20px",
          }}
        >
          {/* Receiver Signature */}
          <div style={{ fontSize: "13px" }}>
            <span>Receivers Signatures: ___________________</span>
          </div>

          {/* Authorized Signature & Stamp Box */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>


            <div style={{ borderTop: "1px solid #000000", width: "160px", paddingTop: "4px", fontSize: "12px", fontWeight: "700" }}>
              Authorized Signature
            </div>
            <div style={{ fontSize: "13px", fontWeight: "800" }}>{shopSettings.shop_name || "BKM MOTORS"}</div>
          </div>
        </div>

        {/* Invoice Bottom Watermark (Bold for Invoices, visible in both software preview & printed invoice) */}
        <Watermark bold={true} style={{ marginTop: "28px", borderTop: "1px dashed #cbd5e1", paddingTop: "10px" }} />
      </div>
    </div>
  );
}

export default function SaleDetailPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, padding: theme.spacing.lg, overflowX: "hidden" }}>
        <Suspense fallback={<div>Loading sale invoice details...</div>}>
          <SaleDetailContent />
        </Suspense>
      </main>
    </div>
  );
}
