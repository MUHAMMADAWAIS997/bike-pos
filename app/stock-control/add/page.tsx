"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import {
  Boxes,
  Plus,
  Trash2,
  CheckCircle2,
  History,
  Truck,
  Package,
  Eye,
} from "lucide-react";

export interface SupplierOption {
  id: string;
  company: string;
}

export interface ProductOption {
  id: string;
  model: string;
  category: string;
  retailPrice: number;
  initialDiscount: number;
  costPrice: number;
}

export interface IntakeSessionItem {
  tempId: string;
  productId: string;
  productModel: string;
  category: string;
  supplierCompany: string;
  batchNo: string;
  quantity: number;
  discount: number;
  retailPrice: number;
  costPrice: number;
}

export default function ReceiveStockPage() {
  const router = useRouter();
  const { notify } = useNotification();

  // Loaded options
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form State
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [retailPrice, setRetailPrice] = useState("");
  const [costPrice, setCostPrice] = useState("0.00");

  // Draft session list
  const [sessionItems, setSessionItems] = useState<IntakeSessionItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch Suppliers and Products for dropdown selection
  useEffect(() => {
    async function loadDropdowns() {
      setLoadingOptions(true);
      try {
        const { invoke } = await import("@tauri-apps/api/core");

        const suppRes: any = await invoke("get_suppliers", {
          search: "",
          orderBy: "company_asc",
          page: 1,
          perPage: 100,
        });

        const prodRes: any = await invoke("get_products", {
          search: "",
          category: "all",
          model: "all",
          orderBy: "model_asc",
          page: 1,
          perPage: 100,
        });

        if (suppRes?.suppliers) {
          setSuppliers(suppRes.suppliers.map((s: any) => ({ id: s.id, company: s.company })));
          if (suppRes.suppliers.length > 0) setSelectedSupplier(suppRes.suppliers[0].company);
        }

        if (prodRes?.products) {
          setProducts(
            prodRes.products.map((p: any) => ({
              id: p.id,
              model: p.model,
              category: p.category,
              retailPrice: p.retail_price,
              initialDiscount: p.initial_discount,
              costPrice: p.cost_price,
            }))
          );
          if (prodRes.products.length > 0) {
            const firstP = prodRes.products[0];
            setSelectedProductId(firstP.id);
            setRetailPrice(firstP.retail_price.toString());
            setCostPrice(firstP.cost_price.toString());
          }
        }
      } catch (err: any) {
        console.error("Failed to load options", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadDropdowns();
  }, []);

  // When selected product changes, update RP and Cost Price defaults
  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const found = products.find((p) => p.id === prodId);
    if (found) {
      setRetailPrice(found.retailPrice.toString());
      setCostPrice(found.costPrice.toString());
    }
  };

  // Add Item to Intake Session
  const handleAddToSession = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedSupplier) {
      setFormError("Please select a Supplier Company.");
      return;
    }

    if (!selectedProductId) {
      setFormError("Please select a Product.");
      return;
    }

    if (!batchNo.trim()) {
      setFormError("Batch Number is required.");
      return;
    }

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setFormError("Quantity must be a positive integer.");
      return;
    }

    const rpNum = parseFloat(retailPrice);
    if (isNaN(rpNum) || rpNum < 0) {
      setFormError("Enter a valid Retail Price.");
      return;
    }

    // Compute discount as rp - cost (user does not enter discount directly)
    const costNum = parseFloat(costPrice) || 0;
    const computedDiscount = Math.max(0, rpNum - costNum);

    const prodObj = products.find((p) => p.id === selectedProductId);

    const newItem: IntakeSessionItem = {
      tempId: `tmp_${Date.now()}_${Math.random()}`,
      productId: selectedProductId,
      productModel: prodObj?.model || "Selected Product",
      category: prodObj?.category || "E-Bike",
      supplierCompany: selectedSupplier,
      batchNo: batchNo.trim(),
      quantity: qtyNum,
      discount: computedDiscount,
      retailPrice: rpNum,
      costPrice: costNum,
    };

    setSessionItems((prev) => [...prev, newItem]);
    notify(`Added ${qtyNum}x "${newItem.productModel}" to current intake session.`, "info");
  };

  // Remove Item from Session Draft
  const handleRemoveFromSession = (tempId: string) => {
    setSessionItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  // Confirm Stock Intake Submission
  const handleConfirmIntake = async () => {
    if (sessionItems.length === 0) {
      notify("Current intake session is empty. Add at least one product before confirming.", "warning");
      return;
    }

    setSubmitting(true);

    try {
      const { invoke } = await import("@tauri-apps/api/core");

      const payloadItems = sessionItems.map((item) => ({
        product_id: item.productId,
        product_model: item.productModel,
        category: item.category,
        quantity: item.quantity,
        discount: item.discount,
        retail_price: item.retailPrice,
        cost_price: item.costPrice,
      }));

      await invoke("add_stock_batch", {
        batchNo: batchNo.trim(),
        supplierCompany: selectedSupplier,
        items: payloadItems,
      });

      notify(`Stock intake session "${batchNo}" confirmed successfully! Inventory updated.`, "success");
      router.push("/stock-control");
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to confirm stock intake.";
      notify(msg, "error", "Intake Failure");
    } finally {
      setSubmitting(false);
    }
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    height: theme.components.formFields.height,
    padding: "0 12px",
    borderRadius: theme.rounded.DEFAULT,
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: theme.colors.onSurface,
    fontSize: "13.5px",
    fontFamily: theme.typography.bodyMd.fontFamily,
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  };

  const totalQuantitySum = sessionItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: theme.spacing.lg,
          maxWidth: "1340px",
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.lg,
        }}
      >
        {/* Header Bar matching Image */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1
              style={{
                fontSize: theme.typography.headlineLg.fontSize,
                fontWeight: theme.typography.headlineLg.fontWeight,
                color: theme.colors.onSurface,
                margin: 0,
              }}
            >
              Receive Stock
            </h1>
            <p style={{ margin: "4px 0 0", color: theme.colors.onSurfaceVariant, fontSize: "14px" }}>
              Intake form for new supplier deliveries and batch tracking.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push("/stock-control")}
            leftIcon={<Eye size={17} />}
          >
            View Available Stock
          </Button>
        </div>

        {/* Grid Container: Left Entry Form (360px) & Right Intake Session Table */}
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "20px", alignItems: "start" }}>
          {/* Left Panel: Entry Details (Purple Scheme) */}
          <Card style={{ border: `1px solid ${theme.cardSchemes.purple.border}`, backgroundColor: theme.cardSchemes.purple.background }}>
            <CardHeader style={{ borderBottom: `1px solid ${theme.cardSchemes.purple.headerBorder}`, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Boxes size={18} color={theme.cardSchemes.purple.accent} />
                <CardTitle style={{ fontSize: "16px", color: theme.cardSchemes.purple.titleText }}>Entry Details</CardTitle>
              </div>
            </CardHeader>

            <CardContent style={{ padding: "20px" }}>
              {formError && (
                <div
                  style={{
                    backgroundColor: theme.colors.errorContainer,
                    color: theme.colors.onErrorContainer,
                    border: "1px solid rgba(186, 26, 26, 0.25)",
                    borderRadius: theme.rounded.DEFAULT,
                    padding: "10px 14px",
                    fontSize: "13px",
                    marginBottom: "16px",
                  }}
                >
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddToSession} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Supplier Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label
                    style={{
                      fontFamily: theme.typography.labelMd.fontFamily,
                      fontSize: "11px",
                      fontWeight: 700,
                      color: theme.cardSchemes.purple.titleText,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    SUPPLIER COMPANY *
                  </label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    disabled={loadingOptions}
                    style={{ ...selectStyle, backgroundColor: "#ffffff", border: "1px solid #d8b4fe" }}
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.company}>
                        {s.company}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label
                    style={{
                      fontFamily: theme.typography.labelMd.fontFamily,
                      fontSize: "11px",
                      fontWeight: 700,
                      color: theme.cardSchemes.purple.titleText,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    PRODUCT *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    disabled={loadingOptions}
                    style={{ ...selectStyle, backgroundColor: "#ffffff", border: "1px solid #d8b4fe" }}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.model} ({p.category}) - {p.retailPrice.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batch Number & Quantity */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <Input
                    label="BATCH NUMBER *"
                    placeholder="e.g. B1-2026-01"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                  />
                  <Input
                    label="QUANTITY *"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                {/* Retail Price & Cost Price */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <Input
                    label="RETAIL PRICE (PKR) *"
                    type="number"
                    step="0.01"
                    placeholder="2499.00"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                  />
                  <Input
                    label="COST PRICE (PKR) *"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    style={{ backgroundColor: "#ffffff", fontWeight: 700, color: theme.cardSchemes.purple.accent, border: "1px solid #d8b4fe" }}
                  />
                </div>

                {/* Margin display (read-only computed) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontFamily: theme.typography.labelMd.fontFamily, fontSize: "11px", fontWeight: 700, color: theme.cardSchemes.purple.titleText, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    MARGIN (RP − COST)
                  </label>
                  <div style={{
                    height: theme.components.formFields.height,
                    padding: "0 12px",
                    borderRadius: theme.rounded.DEFAULT,
                    border: "1px solid #d8b4fe",
                    backgroundColor: "#f8fafc",
                    color: (() => { const m = parseFloat(retailPrice) - parseFloat(costPrice); return isNaN(m) || m < 0 ? theme.colors.error : "#16a34a"; })(),
                    fontSize: "14px", fontWeight: 700,
                    display: "flex", alignItems: "center",
                  }}>
                    {(() => { const rp = parseFloat(retailPrice); const cp = parseFloat(costPrice); if (isNaN(rp) || isNaN(cp)) return "—"; const m = rp - cp; return `Rs. ${m.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; })()}
                  </div>
                </div>

                {/* Add to Session Button */}
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Plus size={16} />}
                  style={{ marginTop: "6px", width: "100%", justifyContent: "center" }}
                >
                  ADD TO SESSION
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right Panel: Current Intake Session Table (Blue Scheme) */}
          <Card style={{ border: `1px solid ${theme.cardSchemes.blue.border}`, backgroundColor: theme.cardSchemes.blue.background }}>
            <CardHeader
              style={{
                borderBottom: `1px solid ${theme.cardSchemes.blue.headerBorder}`,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <CardTitle style={{ fontSize: "16px", margin: 0, color: theme.cardSchemes.blue.titleText }}>Current Intake Session</CardTitle>
                <p style={{ margin: "2px 0 0", color: theme.cardSchemes.blue.text, fontSize: "13px" }}>
                  Review items before final confirmation.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleConfirmIntake}
                disabled={sessionItems.length === 0 || submitting}
                leftIcon={<CheckCircle2 size={16} />}
              >
                {submitting ? "CONFIRMING..." : "CONFIRM STOCK INTAKE"}
              </Button>
            </CardHeader>

            <CardContent style={{ padding: 0 }}>
              {sessionItems.length === 0 ? (
                <div
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    color: theme.colors.onSurfaceVariant,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Package size={36} color={theme.colors.onSurfaceVariant} />
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "15px", color: theme.colors.onSurface }}>
                      No items in current session
                    </h4>
                    <p style={{ margin: 0, fontSize: "13px" }}>
                      Use the left panel to select supplier, batch number, prices, and add items.
                    </p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow isHeader>
                      <TableHead>PRODUCT MODEL</TableHead>
                      <TableHead>CATEGORY</TableHead>
                      <TableHead>SUPPLIER</TableHead>
                      <TableHead>BATCH NO.</TableHead>
                      <TableHead align="center">QTY</TableHead>
                      <TableHead align="right">MARGIN (PKR)</TableHead>
                      <TableHead align="right">RP (PKR)</TableHead>
                      <TableHead align="right">COST (PKR)</TableHead>
                      <TableHead align="center">ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionItems.map((item) => (
                      <TableRow key={item.tempId}>
                        <TableCell style={{ fontWeight: 600, color: theme.colors.onSurface }}>
                          {item.productModel}
                        </TableCell>
                        <TableCell>
                          <Badge variant="primary">{item.category}</Badge>
                        </TableCell>
                        <TableCell>{item.supplierCompany}</TableCell>
                        <TableCell style={{ fontFamily: "monospace", fontSize: "12px" }}>
                          {item.batchNo}
                        </TableCell>
                        <TableCell align="center" style={{ fontWeight: 700 }}>
                          {item.quantity}
                        </TableCell>
                        <TableCell align="right" style={{ fontWeight: 700, color: item.discount < 0 ? theme.colors.error : "#16a34a" }}>
                          Rs. {item.discount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right">${item.retailPrice.toFixed(2)}</TableCell>
                        <TableCell align="right" style={{ fontWeight: 700, color: theme.colors.primary }}>
                          ${item.costPrice.toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <button
                            onClick={() => handleRemoveFromSession(item.tempId)}
                            title="Remove Item"
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: theme.colors.error,
                              padding: "4px",
                              borderRadius: theme.rounded.DEFAULT,
                              display: "inline-flex",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Footer Summary counter */}
              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  backgroundColor: theme.colors.surfaceContainerLowest,
                  fontFamily: theme.typography.labelMd.fontFamily,
                  fontSize: "13px",
                  fontWeight: 600,
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                TOTAL ITEMS:{" "}
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "16px",
                    fontWeight: 800,
                    color: theme.colors.onSurface,
                  }}
                >
                  {totalQuantitySum}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
