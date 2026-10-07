"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import {
  Button,
  Input,
  Card,
} from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import { validatePosCustomer } from "@/lib/validations/pos";
import { useRouter } from "next/navigation";
import {
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  UserCheck,
  Receipt,
  Calendar,
} from "lucide-react";

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export interface ProductCatalogItem {
  id: string;
  model: string;
  category: string;
  color: string;
  battery_type: string;
  volt: string;
  manufacturing_year: number;
  quantity: number;
  retail_price: number;
  cost_price: number;
}

export interface CartItem {
  productId: string;
  model: string;
  category: string;
  color: string;
  batteryType: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
}

export default function POSPage() {
  const router = useRouter();
  const { notify } = useNotification();

  // Catalog State
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("E-Bike");

  // Sale Date Selector State
  const [saleDate, setSaleDate] = useState<string>(getTodayDateString());

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Inline Compulsory Customer State
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerCnic, setCustomerCnic] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerErrors, setCustomerErrors] = useState<Record<string, string>>({});

  // Chassis No & Motor No Footer State
  const [chassisNo, setChassisNo] = useState("");
  const [motorNo, setMotorNo] = useState("");

  // Discount & Manual Installments State
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("amount");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [modalDiscountType, setModalDiscountType] = useState<"percentage" | "amount">("amount");
  const [customDiscountInput, setCustomDiscountInput] = useState("");
  const [modalDiscountError, setModalDiscountError] = useState("");

  const [paymentType, setPaymentType] = useState<"full" | "installment">("full");
  const [installmentMonths, setInstallmentMonths] = useState<number>(3);
  const [installmentFeeType, setInstallmentFeeType] = useState<"percentage" | "fixed">("percentage");
  const [installmentFeeValue, setInstallmentFeeValue] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // Load products catalog from backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: any = await invoke("get_products", {
        search: search.trim(),
        category: selectedCategory,
        model: "all",
        orderBy: "model_asc",
        statusFilter: "active",
        page: 1,
        perPage: 100,
      });
      setProducts(res.products || []);
      if (res?.categories && Array.isArray(res.categories)) {
        const validCats = res.categories.filter((c: string) => c && c.trim().length > 0);
        setAvailableCategories(validCats);

        // If selectedCategory is not in validCats, fallback to E-Bike or first available category
        if (validCats.length > 0 && !validCats.includes(selectedCategory)) {
          const ebikeFound = validCats.find(
            (c: string) => c.trim().toLowerCase() === "e-bike" || c.trim().toLowerCase() === "ebike"
          );
          if (ebikeFound) {
            setSelectedCategory(ebikeFound);
          } else {
            setSelectedCategory(validCats[0]);
          }
        }
      }
    } catch (err: any) {
      notify(err?.message || "Failed to load product catalog.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, notify]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cart operations
  const handleAddToCart = (product: ProductCatalogItem) => {
    if (product.quantity <= 0) {
      notify(`"${product.model}" is currently out of stock.`, "warning");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          notify(`Cannot add more than available stock (${product.quantity}).`, "warning");
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          model: product.model,
          category: product.category,
          color: product.color,
          batteryType: product.battery_type,
          unitPrice: product.retail_price,
          quantity: 1,
          maxQuantity: product.quantity,
        },
      ];
    });

    notify(`Added "${product.model}" to current sale.`, "info");
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.maxQuantity) {
              notify(`Maximum available stock reached (${item.maxQuantity}).`, "warning");
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setDiscountType("amount");
    setPaymentType("full");
    setInstallmentFeeValue(0);
    notify("Current sale cart cleared.", "info");
  };

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount =
    discountType === "percentage"
      ? (subtotal * (discountValue || 0)) / 100
      : (discountValue || 0);

  const installmentFeeAmount =
    paymentType === "installment"
      ? installmentFeeType === "percentage"
        ? (subtotal * (installmentFeeValue || 0)) / 100
        : (installmentFeeValue || 0)
      : 0;

  const totalAmount = Math.max(0, subtotal - discountAmount + installmentFeeAmount);
  const validMonths = Math.max(1, installmentMonths || 1);
  const monthlyInstallment = paymentType === "installment" ? totalAmount / validMonths : 0;

  const isEbikeSelected =
    selectedCategory.trim().toLowerCase() === "e-bike" ||
    selectedCategory.trim().toLowerCase() === "ebike";

  const handleCategorySelect = (catValue: string) => {
    setSelectedCategory(catValue);
    const isEbike = catValue.trim().toLowerCase() === "e-bike" || catValue.trim().toLowerCase() === "ebike";

    if (!isEbike) {
      setPaymentType("full");
      setCustomerAddress("N/A");
      setCustomerCnic("N/A");
      setChassisNo("N/A");
      setMotorNo("N/A");
    } else {
      if (customerAddress === "N/A") setCustomerAddress("");
      if (customerCnic === "N/A") setCustomerCnic("");
      if (chassisNo === "N/A") setChassisNo("");
      if (motorNo === "N/A") setMotorNo("");
    }
  };

  // Complete Sale Submission with Optional Customer Details & Chassis/Motor No.
  const handleCompleteSale = async () => {
    setCustomerErrors({});

    if (cart.length === 0) {
      notify("Cart is empty. Add products before completing sale.", "warning");
      return;
    }

    const finalName = customerName.trim() || "Walk-in Customer";
    const finalMobile = customerMobile.trim() || "03000000000";
    const finalCnic = customerCnic.trim() || "N/A";
    const finalAddress = customerAddress.trim() || "N/A";
    const finalChassis = chassisNo.trim() || "N/A";
    const finalMotor = motorNo.trim() || "N/A";

    const validation = validatePosCustomer(
      {
        customerName: finalName,
        customerMobile: finalMobile,
        customerCnic: finalCnic,
        customerAddress: finalAddress,
        chassisNo: finalChassis,
        motorNo: finalMotor,
      },
      isEbikeSelected
    );

    if (!validation.success) {
      setCustomerErrors(validation.errors || {});
      notify(validation.firstError || "Please fix validation errors in customer details.", "warning", "Validation Error");
      return;
    }

    setSubmitting(true);

    try {
      const { invoke } = await import("@tauri-apps/api/core");

      const saleItemsPayload = cart.map((item) => ({
        product_id: item.productId,
        product_model: item.model,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
      }));

      const createdSale: any = await invoke("create_sale", {
        customerName: finalName,
        customerMobile: finalMobile,
        customerCnic: finalCnic,
        customerAddress: finalAddress,
        chassisNo: finalChassis,
        motorNo: finalMotor,
        subtotal,
        discountAmount,
        totalAmount,
        paymentType: isEbikeSelected ? paymentType : "full",
        installmentMonths: validMonths,
        monthlyInstallment,
        installmentFeeType,
        installmentFeeValue,
        installmentFeeAmount,
        items: saleItemsPayload,
        saleDate: saleDate || null,
      });

      notify(
        `Sale completed & ledger recorded for ${customerName}! ${
          paymentType === "installment" && isEbikeSelected
            ? `Installment Plan (${validMonths} mos @ ${monthlyInstallment.toFixed(2)}/mo)`
            : "Full payment recorded."
        }`,
        "success"
      );

      // Check printer automation settings
      const settings: any = await invoke("get_shop_settings").catch(() => null);
      const autoShow = settings?.auto_show_receipt !== false;
      const silent = Boolean(settings?.silent_printing);

      setCart([]);
      setDiscountValue(0);
      setDiscountType("amount");
      setPaymentType("full");
      setCustomerName("");
      setCustomerMobile("");
      setCustomerCnic(isEbikeSelected ? "" : "N/A");
      setCustomerAddress(isEbikeSelected ? "" : "N/A");
      setChassisNo(isEbikeSelected ? "" : "N/A");
      setMotorNo(isEbikeSelected ? "" : "N/A");
      setSaleDate(getTodayDateString());
      fetchProducts(); // Refresh catalog stock levels

      if ((autoShow || silent) && createdSale?.id) {
        router.push(`/sales/details?id=${createdSale.id}${silent ? "&autoPrint=true" : ""}`);
      }
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to complete sale.";
      notify(msg, "error", "Checkout Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const categoriesList = availableCategories.map((cat) => ({ label: cat, value: cat }));

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />

      <style jsx global>{`
        .pos-main-container {
          display: flex;
          flex-direction: row;
          flex: 1;
          min-height: 100vh;
          overflow: hidden;
        }
        .pos-left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          border-right: 1px solid #cbd5e1;
          min-width: 0;
        }
        .pos-right-panel {
          width: 440px;
          min-width: 320px;
          background-color: ${theme.colors.surfaceContainerLowest};
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          border-left: 1px solid #cbd5e1;
        }
        @media (max-width: 1024px) {
          .pos-main-container {
            flex-direction: column;
            overflow-y: auto;
            height: auto;
            min-height: 100vh;
          }
          .pos-left-panel {
            height: auto;
            border-right: none;
            border-bottom: 2px solid #cbd5e1;
          }
          .pos-right-panel {
            width: 100%;
            min-width: 0;
            height: auto;
            border-left: none;
          }
        }
      `}</style>

      <main className="pos-main-container">
        {/* CENTER PANEL: Catalog & Sticky Footer */}
        <div className="pos-left-panel">
          {/* Scrollable Center Catalog Content */}
          <div
            style={{
              flex: 1,
              padding: theme.spacing.lg,
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              overflowY: "auto",
            }}
          >
            {/* Header Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  fontSize: theme.typography.headlineLg.fontSize,
                  fontWeight: theme.typography.headlineLg.fontWeight,
                  color: theme.colors.onSurface,
                  margin: 0,
                }}
              >
                BKM Motors POS
              </h1>

              {/* Date Selection Control */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#f0f9ff",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: theme.rounded.md,
                    padding: "4px 10px",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Calendar size={15} color="#0c4a6e" />
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0c4a6e", whiteSpace: "nowrap" }}>
                    Sale Date:
                  </span>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
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
                  onClick={() => router.push("/sales")}
                  leftIcon={<Receipt size={15} />}
                >
                  View Sale Records
                </Button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {categoriesList.map((cat) => {
                const isActive = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => handleCategorySelect(cat.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: isActive ? `1.5px solid ${theme.colors.primary}` : "1.5px solid #cbd5e1",
                      backgroundColor: isActive ? theme.colors.primary : "#ffffff",
                      color: isActive ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "13px",
                      fontFamily: theme.typography.labelMd.fontFamily,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Product Cards Grid (No $ symbol, clean text details only) */}
            {loading ? (
              <div style={{ padding: "60px 0", textAlign: "center", color: theme.colors.onSurfaceVariant }}>
                Loading products catalog...
              </div>
            ) : products.length === 0 ? (
              <div style={{ padding: "60px 0", textAlign: "center", color: theme.colors.onSurfaceVariant }}>
                No products found in catalog. Add products in Inventory to start selling.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {products.map((p) => {
                  const isOutOfStock = p.quantity <= 0;
                  const isLowStock = p.quantity > 0 && p.quantity <= 3;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleAddToCart(p)}
                      style={{
                        border: "1.5px solid #cbd5e1",
                        borderRadius: theme.rounded.lg,
                        padding: "16px",
                        backgroundColor: theme.colors.surfaceContainerLowest,
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        position: "relative",
                        transition: "all 0.15s ease",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                        opacity: isOutOfStock ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isOutOfStock) {
                          e.currentTarget.style.borderColor = theme.colors.primary;
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#cbd5e1";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                      }}
                    >
                      {/* Stock Pill Badge */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: theme.colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {p.category}
                        </span>

                        <div
                          style={{
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            backgroundColor: isOutOfStock
                              ? "#fee2e2"
                              : isLowStock
                              ? "#fef3c7"
                              : "#dcfce7",
                            color: isOutOfStock ? "#dc2626" : isLowStock ? "#d97706" : "#15803d",
                            border: `1px solid ${
                              isOutOfStock ? "#fca5a5" : isLowStock ? "#fde68a" : "#86efac"
                            }`,
                          }}
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : isLowStock
                            ? `Low Stock: ${p.quantity}`
                            : `In Stock: ${p.quantity}`}
                        </div>
                      </div>

                      {/* Model Name */}
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 800,
                          color: theme.colors.onSurface,
                          margin: "2px 0",
                        }}
                      >
                        {p.model}
                      </div>

                      {/* Specs Details List */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "12.5px", color: "#334155" }}>
                        <div><strong style={{ color: "#64748b" }}>Color:</strong> {p.color}</div>
                        <div><strong style={{ color: "#64748b" }}>Battery:</strong> {p.battery_type}</div>
                        <div><strong style={{ color: "#64748b" }}>Volt:</strong> {p.volt}</div>
                        <div><strong style={{ color: "#64748b" }}>Year:</strong> {p.manufacturing_year}</div>
                      </div>

                      {/* Price Tag (PKR, No $ Symbol) */}
                      <div
                        style={{
                          marginTop: "8px",
                          paddingTop: "8px",
                          borderTop: "1px dashed #cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontSize: "18px", fontWeight: 800, color: theme.colors.primary }}>
                          {p.retail_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>

                        <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.primary, display: "flex", alignItems: "center" }}>
                          <Plus size={16} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sticky Bottom Footer Bar: Chassis No & Motor No Inputs */}
          <div
            style={{
              padding: "12px 20px",
              backgroundColor: "#f8fafc",
              borderTop: "1.5px solid #cbd5e1",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                Chassis No. (Optional)
              </span>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder={isEbikeSelected ? "Enter Chassis No. (Optional)" : "Chassis No. (N/A)"}
                  value={chassisNo}
                  onChange={(e) => setChassisNo(e.target.value)}
                  disabled={!isEbikeSelected}
                  error={customerErrors.chassisNo}
                  style={{ height: "36px", fontSize: "13px", backgroundColor: !isEbikeSelected ? "#f1f5f9" : "#ffffff" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                Motor No. (Optional)
              </span>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder={isEbikeSelected ? "Enter Motor No. (Optional)" : "Motor No. (N/A)"}
                  value={motorNo}
                  onChange={(e) => setMotorNo(e.target.value)}
                  disabled={!isEbikeSelected}
                  error={customerErrors.motorNo}
                  style={{ height: "36px", fontSize: "13px", backgroundColor: !isEbikeSelected ? "#f1f5f9" : "#ffffff" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Current Sale with Fixed Top/Bottom & Scrollable Cart Items */}
        <div className="pos-right-panel">
          {/* Top Fixed Header & Inline Customer Form */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1.5px solid #cbd5e1",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              backgroundColor: "#ffffff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShoppingBag size={20} color={theme.colors.primary} />
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: theme.colors.onSurface }}>
                  Current Sale
                </h2>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  title="Clear Cart"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: theme.colors.error,
                    padding: "4px",
                    display: "flex",
                  }}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {/* Inline Customer Details Form */}
            <div
              style={{
                padding: "12px",
                borderRadius: theme.rounded.DEFAULT,
                backgroundColor: "#f8fafc",
                border: "1.5px solid #cbd5e1",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <UserCheck size={16} color={theme.colors.primary} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: theme.colors.primary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  CUSTOMER DETAILS (OPTIONAL)
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                <Input
                  placeholder="Full Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  error={customerErrors.customerName}
                  style={{ height: "34px", fontSize: "12.5px" }}
                />
                <Input
                  placeholder="Mobile No (Optional)"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  error={customerErrors.customerMobile}
                  style={{ height: "34px", fontSize: "12.5px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                <Input
                  placeholder={isEbikeSelected ? "CNIC Number (Optional)" : "CNIC Number (N/A)"}
                  value={customerCnic}
                  onChange={(e) => setCustomerCnic(e.target.value)}
                  disabled={!isEbikeSelected}
                  error={customerErrors.customerCnic}
                  style={{ height: "34px", fontSize: "12.5px", backgroundColor: !isEbikeSelected ? "#f1f5f9" : "#ffffff" }}
                />
                <Input
                  placeholder={isEbikeSelected ? "Full Address (Optional)" : "Full Address (N/A)"}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  disabled={!isEbikeSelected}
                  error={customerErrors.customerAddress}
                  style={{ height: "34px", fontSize: "12.5px", backgroundColor: !isEbikeSelected ? "#f1f5f9" : "#ffffff" }}
                />
              </div>
            </div>
          </div>

          {/* Middle Scrollable Section: Cart Items (Single Row Layout, No $ symbol) */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {cart.length === 0 ? (
              <div
                style={{
                  padding: "40px 16px",
                  textAlign: "center",
                  color: theme.colors.onSurfaceVariant,
                  fontSize: "13.5px",
                  border: "1.5px dashed #cbd5e1",
                  borderRadius: theme.rounded.md,
                }}
              >
                No items added to current sale yet. Click products on the left to add items.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    padding: "10px 12px",
                    borderRadius: theme.rounded.DEFAULT,
                    border: "1.5px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  {/* Item Model Name & Color */}
                  <div style={{ flex: "1 1 120px", minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "13.5px",
                        color: theme.colors.onSurface,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.model}
                    </div>
                    <div style={{ fontSize: "11.5px", color: theme.colors.onSurfaceVariant }}>
                      {item.color}
                    </div>
                  </div>

                  {/* Price (No $ symbol) */}
                  <div style={{ fontWeight: 800, fontSize: "14px", color: theme.colors.onSurface, whiteSpace: "nowrap" }}>
                    {(item.unitPrice * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>

                  {/* Single Row Quantity Controls & Remove Button */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        border: "1px solid #cbd5e1",
                        borderRadius: theme.rounded.DEFAULT,
                        padding: "2px 6px",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <button
                        onClick={() => handleUpdateQty(item.productId, -1)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex" }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontSize: "13px", fontWeight: 700, minWidth: "18px", textAlign: "center", color: theme.colors.onSurface }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.productId, 1)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex" }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(item.productId)}
                      title="Remove item"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: theme.colors.error,
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Fixed Section: Checkout & Bill Breakdown (No $ symbol!) */}
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1.5px solid #cbd5e1",
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Subtotal */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", color: theme.colors.onSurfaceVariant }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: theme.colors.onSurface }}>
                {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Discount */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", color: theme.colors.onSurfaceVariant, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>
                  Discount {discountType === "percentage" && discountValue > 0 ? `(${discountValue}%)` : ""}
                </span>
                <button
                  onClick={() => {
                    setModalDiscountType(discountType);
                    setCustomDiscountInput(discountValue > 0 ? discountValue.toString() : "");
                    setModalDiscountError("");
                    setIsDiscountModalOpen(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: theme.colors.primary,
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {discountAmount > 0 ? "Edit" : "Add"}
                </button>
              </div>
              <span style={{ fontWeight: 600, color: discountAmount > 0 ? theme.colors.primary : theme.colors.onSurface }}>
                -{discountAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Payment Method Option: Full vs Manual Installment Months */}
            <div style={{ padding: "10px", borderRadius: theme.rounded.DEFAULT, backgroundColor: "#f8fafc", border: "1.5px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: theme.colors.onSurface, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                PAYMENT SCHEME
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setPaymentType("full")}
                  style={{
                    padding: "6px 8px",
                    borderRadius: theme.rounded.DEFAULT,
                    border: paymentType === "full" ? `1.5px solid ${theme.colors.primary}` : "1.5px solid #cbd5e1",
                    backgroundColor: paymentType === "full" ? theme.colors.surfaceContainer : "#ffffff",
                    color: paymentType === "full" ? theme.colors.primary : theme.colors.onSurfaceVariant,
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Full Payment
                </button>

                <button
                  type="button"
                  disabled={!isEbikeSelected}
                  onClick={() => {
                    if (isEbikeSelected) setPaymentType("installment");
                  }}
                  title={!isEbikeSelected ? "Installment scheme is only available for E-Bikes" : ""}
                  style={{
                    padding: "6px 8px",
                    borderRadius: theme.rounded.DEFAULT,
                    border: paymentType === "installment" && isEbikeSelected ? `1.5px solid ${theme.colors.primary}` : "1.5px solid #cbd5e1",
                    backgroundColor: !isEbikeSelected
                      ? "#f1f5f9"
                      : paymentType === "installment"
                      ? theme.colors.surfaceContainer
                      : "#ffffff",
                    color: !isEbikeSelected
                      ? "#94a3b8"
                      : paymentType === "installment"
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant,
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: !isEbikeSelected ? "not-allowed" : "pointer",
                    opacity: !isEbikeSelected ? 0.6 : 1,
                  }}
                >
                  Installments
                </button>
              </div>

              {/* Manual Installments Month & Fee Input */}
              {paymentType === "installment" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap" }}>
                      Installment Months:
                    </span>
                    <div style={{ width: "90px" }}>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Months"
                        value={installmentMonths || ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setInstallmentMonths(!isNaN(val) && val > 0 ? val : 1);
                        }}
                        style={{ height: "32px", fontSize: "13px", backgroundColor: "#ffffff", textAlign: "center" }}
                      />
                    </div>
                  </div>

                  {/* Installment Fee / Extra Surcharge Options */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", backgroundColor: "#f8fafc", padding: "8px", borderRadius: theme.rounded.md, border: "1px solid #cbd5e1" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                        Installment Fee / Extra Charge:
                      </span>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => setInstallmentFeeType("percentage")}
                          style={{
                            padding: "2px 6px",
                            fontSize: "10px",
                            fontWeight: 700,
                            borderRadius: "3px",
                            border: "none",
                            backgroundColor: installmentFeeType === "percentage" ? theme.colors.primary : "#cbd5e1",
                            color: installmentFeeType === "percentage" ? "#ffffff" : "#475569",
                            cursor: "pointer",
                          }}
                        >
                          %
                        </button>
                        <button
                          type="button"
                          onClick={() => setInstallmentFeeType("fixed")}
                          style={{
                            padding: "2px 6px",
                            fontSize: "10px",
                            fontWeight: 700,
                            borderRadius: "3px",
                            border: "none",
                            backgroundColor: installmentFeeType === "fixed" ? theme.colors.primary : "#cbd5e1",
                            color: installmentFeeType === "fixed" ? "#ffffff" : "#475569",
                            cursor: "pointer",
                          }}
                        >
                          Rs.
                        </button>
                      </div>
                    </div>

                    <Input
                      type="number"
                      min="0"
                      placeholder={installmentFeeType === "percentage" ? "Fee % (e.g. 5 or 10)" : "Fixed Fee (e.g. 50000)"}
                      value={installmentFeeValue || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setInstallmentFeeValue(!isNaN(val) && val >= 0 ? val : 0);
                      }}
                      style={{ height: "30px", fontSize: "12px", backgroundColor: "#ffffff" }}
                    />

                    {installmentFeeAmount > 0 && (
                      <div style={{ fontSize: "11px", color: theme.colors.primary, fontWeight: 700, textAlign: "right" }}>
                        + Rs. {installmentFeeAmount.toLocaleString()} Extra Markup Fee
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      padding: "6px 8px",
                      borderRadius: theme.rounded.DEFAULT,
                      backgroundColor: "#e0f2fe",
                      color: "#0369a1",
                      fontSize: "12px",
                      fontWeight: 700,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <div>Rs. {monthlyInstallment.toFixed(2)} / month for {validMonths} months</div>
                    {installmentFeeAmount > 0 && (
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#0284c7" }}>
                        (Base: Rs. {((subtotal - discountAmount) / validMonths).toFixed(2)} + Fee: Rs. {(installmentFeeAmount / validMonths).toFixed(2)} / mo)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Total Display (No $ symbol) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "2px 0" }}>
              <span style={{ fontSize: "17px", fontWeight: 700, color: theme.colors.onSurface }}>Total</span>
              <span style={{ fontSize: "24px", fontWeight: 800, color: theme.colors.primary }}>
                {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Checkout Action Button */}
            <Button
              variant="primary"
              size="lg"
              disabled={cart.length === 0 || submitting}
              onClick={handleCompleteSale}
              leftIcon={<CheckCircle2 size={18} />}
              style={{ width: "100%", justifyContent: "center", height: "44px", fontSize: "15px" }}
            >
              {submitting ? "Processing Sale..." : "Complete Sale"}
            </Button>
          </div>
        </div>

        {/* Discount Edit Modal */}
        {isDiscountModalOpen && (
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
            onClick={() => setIsDiscountModalOpen(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                maxHeight: "90vh",
                overflowY: "auto",
                backgroundColor: theme.colors.surfaceContainerLowest,
                border: "1px solid #cbd5e1",
                borderRadius: theme.rounded.xl,
                padding: "22px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                boxSizing: "border-box",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: theme.colors.onSurface }}>
                  Apply Cart Discount
                </h3>
                <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.onSurfaceVariant, backgroundColor: theme.colors.surfaceContainerLow, padding: "3px 8px", borderRadius: "6px" }}>
                  Subtotal: Rs. {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Discount Type Selector Toggle */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: theme.colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Discount Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: theme.rounded.md }}>
                  <button
                    type="button"
                    onClick={() => {
                      setModalDiscountType("amount");
                      setModalDiscountError("");
                    }}
                    style={{
                      padding: "8px",
                      borderRadius: theme.rounded.DEFAULT,
                      border: "none",
                      backgroundColor: modalDiscountType === "amount" ? theme.colors.primary : "transparent",
                      color: modalDiscountType === "amount" ? "#ffffff" : theme.colors.onSurfaceVariant,
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Fixed Amount (Rs.)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalDiscountType("percentage");
                      setModalDiscountError("");
                    }}
                    style={{
                      padding: "8px",
                      borderRadius: theme.rounded.DEFAULT,
                      border: "none",
                      backgroundColor: modalDiscountType === "percentage" ? theme.colors.primary : "transparent",
                      color: modalDiscountType === "percentage" ? "#ffffff" : theme.colors.onSurfaceVariant,
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Percentage (%)
                  </button>
                </div>
              </div>

              {/* Discount Input Field */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: theme.colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {modalDiscountType === "percentage" ? "Discount Percentage (1% - 100%)" : "Discount Amount (PKR)"}
                </label>
                <Input
                  type="number"
                  step={modalDiscountType === "percentage" ? "1" : "0.01"}
                  min={modalDiscountType === "percentage" ? "1" : "0"}
                  max={modalDiscountType === "percentage" ? "100" : subtotal.toString()}
                  placeholder={modalDiscountType === "percentage" ? "e.g. 10 for 10%" : `Max Rs. ${subtotal.toLocaleString()}`}
                  value={customDiscountInput}
                  onChange={(e) => {
                    setCustomDiscountInput(e.target.value);
                    setModalDiscountError("");
                  }}
                  autoFocus
                />

                {/* Validation Error Alert */}
                {modalDiscountError && (
                  <div style={{ fontSize: "12px", color: theme.colors.error, fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                    <span>⚠ {modalDiscountError}</span>
                  </div>
                )}

                {/* Live Calculation Preview */}
                {customDiscountInput && !modalDiscountError && (
                  <div style={{ fontSize: "12px", color: theme.colors.primary, fontWeight: 600, marginTop: "2px" }}>
                    {(() => {
                      const num = parseFloat(customDiscountInput);
                      if (isNaN(num)) return null;
                      if (modalDiscountType === "percentage") {
                        if (num >= 1 && num <= 100) {
                          const calcAmt = (subtotal * num) / 100;
                          return `Calculated Discount: - Rs. ${calcAmt.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
                        }
                      } else {
                        if (num >= 0 && num <= subtotal) {
                          const pct = subtotal > 0 ? (num / subtotal) * 100 : 0;
                          return `Effective Discount: ${pct.toFixed(1)}% (- Rs. ${num.toLocaleString("en-US", { minimumFractionDigits: 2 })})`;
                        }
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <Button variant="outline" onClick={() => setIsDiscountModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const num = parseFloat(customDiscountInput);

                    if (isNaN(num) || num <= 0) {
                      setDiscountValue(0);
                      setDiscountType(modalDiscountType);
                      setIsDiscountModalOpen(false);
                      return;
                    }

                    if (modalDiscountType === "percentage") {
                      if (num < 1 || num > 100) {
                        const errMsg = "Percentage discount must be between 1% and 100%.";
                        setModalDiscountError(errMsg);
                        notify(errMsg, "warning");
                        return;
                      }
                    } else {
                      if (num > subtotal) {
                        const errMsg = `Discount amount cannot exceed cart retail price (Rs. ${subtotal.toLocaleString()}).`;
                        setModalDiscountError(errMsg);
                        notify(errMsg, "warning");
                        return;
                      }
                    }

                    setDiscountType(modalDiscountType);
                    setDiscountValue(num);
                    setModalDiscountError("");
                    setIsDiscountModalOpen(false);
                    const appliedText = modalDiscountType === "percentage"
                      ? `${num}% discount applied`
                      : `Rs. ${num.toLocaleString()} discount applied`;
                    notify(appliedText, "success");
                  }}
                >
                  Apply Discount
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
