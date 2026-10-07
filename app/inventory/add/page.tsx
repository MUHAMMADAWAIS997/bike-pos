"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import { productSchema, ProductInput } from "@/lib/validations/product";
import { PackagePlus, Save, Package, Motorbike, Edit, RefreshCw } from "lucide-react";

function AddEditProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);
  const { notify } = useNotification();

  // Top Radio Button State: "ebike" (default) or "other"
  const [productType, setProductType] = useState<"ebike" | "other">("ebike");
  const [fetchingEditData, setFetchingEditData] = useState(false);

  const [formData, setFormData] = useState({
    model: "",
    category: "E-Bike",
    color: "",
    batteryType: "",
    volt: "",
    manufacturingYear: new Date().getFullYear().toString(),
    retailPrice: "",
    costPrice: "",
    incentive: "",
    others: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Load existing product details if editing
  useEffect(() => {
    if (!editId) return;

    const loadProduct = async () => {
      setFetchingEditData(true);
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const prod: any = await invoke("get_product_by_id", { id: editId });

        if (prod) {
          const isEbike = prod.color !== "N/A" && prod.battery_type !== "N/A" && prod.volt !== "N/A";
          setProductType(isEbike ? "ebike" : "other");
          setFormData({
            model: prod.model || "",
            category: prod.category || (isEbike ? "E-Bike" : "Others"),
            color: prod.color === "N/A" ? "" : prod.color || "",
            batteryType: prod.battery_type === "N/A" ? "" : prod.battery_type || "",
            volt: prod.volt === "N/A" ? "" : prod.volt || "",
            manufacturingYear: (prod.manufacturing_year || new Date().getFullYear()).toString(),
            retailPrice: (prod.retail_price || 0).toString(),
            costPrice: (prod.cost_price || 0).toString(),
            incentive: prod.incentive != null ? prod.incentive.toString() : "",
            others: prod.others || "",
          });
        }
      } catch (err: any) {
        notify(err?.message || "Failed to load product details for editing.", "error");
      } finally {
        setFetchingEditData(false);
      }
    };

    loadProduct();
  }, [editId, notify]);

  // Switch product type handler
  const handleProductTypeChange = (type: "ebike" | "other") => {
    setProductType(type);
    setErrors({});
    setServerError(null);

    if (type === "ebike") {
      setFormData((prev) => ({
        ...prev,
        category: "E-Bike",
        color: prev.color === "N/A" ? "" : prev.color,
        batteryType: prev.batteryType === "N/A" ? "" : prev.batteryType,
        volt: prev.volt === "N/A" ? "48V" : prev.volt,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        category: prev.category === "E-Bike" ? "Others" : prev.category,
        color: "N/A",
        batteryType: "N/A",
        volt: "N/A",
        manufacturingYear: new Date().getFullYear().toString(),
      }));
    }
  };


  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setServerError(null);
  };

  const validate = (): ProductInput => {
    setErrors({});
    setServerError(null);

    const isEbike = productType === "ebike";

    const modelVal = formData.model.trim() || "Unnamed Product";
    const categoryVal = formData.category.trim() || (isEbike ? "E-Bike" : "Others");
    const colorVal = isEbike ? (formData.color.trim() || "Standard") : "N/A";
    const batteryTypeVal = isEbike ? (formData.batteryType.trim() || "Standard") : "N/A";
    const voltVal = isEbike ? (formData.volt.trim() || "48V") : "N/A";
    const yearNum = isEbike ? (parseInt(formData.manufacturingYear, 10) || new Date().getFullYear()) : new Date().getFullYear();
    const priceNum = parseFloat(formData.retailPrice);
    const costNum = parseFloat(formData.costPrice);
    const incNum = isEbike && formData.incentive.trim() ? parseFloat(formData.incentive) : null;

    const rawPayload = {
      model: modelVal,
      category: categoryVal,
      color: colorVal,
      batteryType: batteryTypeVal,
      volt: voltVal,
      manufacturingYear: yearNum,
      retailPrice: isNaN(priceNum) || priceNum < 0 ? 0 : priceNum,
      costPrice: isNaN(costNum) || costNum < 0 ? 0 : costNum,
      incentive: incNum != null && !isNaN(incNum) && incNum >= 0 ? incNum : null,
      others: formData.others.trim() || null,
    };

    const result = productSchema.safeParse(rawPayload);

    if (!result.success) {
      return {
        model: modelVal,
        category: categoryVal,
        color: colorVal,
        batteryType: batteryTypeVal,
        volt: voltVal,
        manufacturingYear: yearNum,
        retailPrice: isNaN(priceNum) || priceNum < 0 ? 0 : priceNum,
        costPrice: isNaN(costNum) || costNum < 0 ? 0 : costNum,
        incentive: null,
        others: null,
      };
    }

    return result.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validatedData = validate();
    if (!validatedData) return;

    setLoading(true);

    try {
      const { invoke } = await import("@tauri-apps/api/core");

      if (isEditMode && editId) {
        await invoke("update_product", {
          id: editId,
          model: validatedData.model,
          category: validatedData.category,
          color: validatedData.color,
          batteryType: validatedData.batteryType,
          volt: validatedData.volt,
          manufacturingYear: validatedData.manufacturingYear,
          retailPrice: validatedData.retailPrice,
          costPrice: validatedData.costPrice,
          incentive: validatedData.incentive ?? null,
          others: validatedData.others ?? null,
        });

        notify(`Product "${validatedData.model}" updated successfully!`, "success");
      } else {
        // discount = rp - cost (computed automatically, not entered by user)
        const computedDiscount = Math.max(0, validatedData.retailPrice - validatedData.costPrice);
        await invoke("add_product", {
          model: validatedData.model,
          category: validatedData.category,
          color: validatedData.color,
          batteryType: validatedData.batteryType,
          volt: validatedData.volt,
          manufacturingYear: validatedData.manufacturingYear,
          initialQuantity: 0,
          initialDiscount: computedDiscount,
          retailPrice: validatedData.retailPrice,
          costPrice: validatedData.costPrice,
          incentive: validatedData.incentive ?? null,
          others: validatedData.others ?? null,
        });

        notify(`Product "${validatedData.model}" added to inventory!`, "success");
      }

      router.push("/inventory");
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to save product.";
      setServerError(msg);
      if (msg.includes("already exists") || msg.includes("model")) {
        setErrors((prev) => ({ ...prev, model: msg }));
      }
      notify(msg, "error", "Submission Error");
    } finally {
      setLoading(false);
    }
  };

  // Section Badge Component
  const SectionBadge = ({ number, title }: { number: string; title: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 0 6px 0" }}>
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
          fontSize: "11px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.typography.labelMd.fontFamily,
          flexShrink: 0,
        }}
      >
        {number}
      </div>
      <h3
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: theme.colors.primary,
          fontFamily: theme.typography.labelMd.fontFamily,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {title}
      </h3>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: "16px",
          maxWidth: "1000px",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: theme.colors.onSurface,
                margin: 0,
              }}
            >
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h1>
            <p style={{ margin: "2px 0 0", color: theme.colors.onSurfaceVariant, fontSize: "13px" }}>
              {isEditMode
                ? "Update product specifications, prices, and catalog details."
                : "Enter the details of the new electric bike or accessory to track in inventory."}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/inventory")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-product-form"
              variant="primary"
              size="sm"
              disabled={loading || fetchingEditData}
              leftIcon={isEditMode ? <Edit size={15} /> : <Save size={15} />}
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                ? "Update Product"
                : "Save Product"}
            </Button>
          </div>
        </div>

        {/* Product Form Card */}
        <Card style={{ backgroundColor: theme.colors.surfaceContainerLowest, border: "1px solid #cbd5e1" }}>
          <CardHeader style={{ padding: "10px 16px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isEditMode ? (
                <Edit size={18} color={theme.colors.primary} />
              ) : (
                <PackagePlus size={18} color={theme.colors.primary} />
              )}
              <CardTitle style={{ fontSize: "15px" }}>
                {isEditMode ? "Edit Product Specifications" : "Product Specifications & Inventory Details"}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent style={{ padding: "14px 16px" }}>
            {fetchingEditData ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "24px 0" }}>
                <RefreshCw size={24} color={theme.colors.primary} className="animate-spin" />
                <p style={{ margin: 0, color: theme.colors.onSurfaceVariant, fontSize: "13px" }}>
                  Loading product details...
                </p>
              </div>
            ) : (
              <>
                {serverError && (
                  <div
                    style={{
                      backgroundColor: theme.colors.errorContainer,
                      color: theme.colors.onErrorContainer,
                      border: "1px solid rgba(186, 26, 26, 0.25)",
                      borderRadius: theme.rounded.DEFAULT,
                      padding: "8px 12px",
                      fontSize: "12.5px",
                      marginBottom: "12px",
                    }}
                  >
                    {serverError}
                  </div>
                )}

                {/* Top Radio Buttons for Product Type */}
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      fontFamily: theme.typography.labelMd.fontFamily,
                      fontSize: "11px",
                      fontWeight: 700,
                      color: theme.colors.onSurfaceVariant,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    SELECT PRODUCT TYPE (OPTIONAL)
                  </label>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {/* Option 1: E-Bike */}
                    <div
                      onClick={() => handleProductTypeChange("ebike")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        borderRadius: theme.rounded.md,
                        border: productType === "ebike" ? `2px solid ${theme.colors.primary}` : "1.5px solid #cbd5e1",
                        backgroundColor: productType === "ebike" ? "#f0f9ff" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: productType === "ebike" ? "0 2px 6px rgba(2, 132, 199, 0.1)" : "none",
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: productType === "ebike" ? `5px solid ${theme.colors.primary}` : "2px solid #94a3b8",
                          backgroundColor: "#ffffff",
                          boxSizing: "border-box",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            backgroundColor: productType === "ebike" ? theme.colors.primary : "#f1f5f9",
                            color: productType === "ebike" ? "#ffffff" : "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Motorbike size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: "13.5px", fontWeight: 700, color: theme.colors.onSurface }}>
                            E-Bike
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Other */}
                    <div
                      onClick={() => handleProductTypeChange("other")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        borderRadius: theme.rounded.md,
                        border: productType === "other" ? `2px solid ${theme.colors.primary}` : "1.5px solid #cbd5e1",
                        backgroundColor: productType === "other" ? "#f0f9ff" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: productType === "other" ? "0 2px 6px rgba(2, 132, 199, 0.1)" : "none",
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: productType === "other" ? `5px solid ${theme.colors.primary}` : "2px solid #94a3b8",
                          backgroundColor: "#ffffff",
                          boxSizing: "border-box",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            backgroundColor: productType === "other" ? theme.colors.primary : "#f1f5f9",
                            color: productType === "other" ? "#ffffff" : "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Package size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: "13.5px", fontWeight: 700, color: theme.colors.onSurface }}>
                            Other
                          </div>
                          <div style={{ fontSize: "11.5px", color: theme.colors.onSurfaceVariant }}>
                            Chargers, spare parts, and general inventory
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <form
                  id="add-product-form"
                  onSubmit={handleSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                >
                  {productType === "other" ? (
                    /* Simplified Form for Other / Accessories */
                    <>
                      <div>
                        <SectionBadge number="1" title="Product Details & Pricing" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                          <Input
                            label="ITEM NAME / MODEL (OPTIONAL)"
                            placeholder="e.g. Smart Charger 60V / Helmet"
                            value={formData.model}
                            onChange={(e) => handleChange("model", e.target.value)}
                            error={errors.model}
                            disabled={loading}
                          />

                          <Input
                            label="CATEGORY (OPTIONAL)"
                            placeholder="e.g. Accessories / Spare Parts"
                            value={formData.category}
                            onChange={(e) => handleChange("category", e.target.value)}
                            error={errors.category}
                            disabled={loading}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                          <Input
                            label="RETAIL PRICE (Rs.) (OPTIONAL)"
                            placeholder="2500.00"
                            type="number"
                            step="0.01"
                            value={formData.retailPrice}
                            onChange={(e) => handleChange("retailPrice", e.target.value)}
                            error={errors.retailPrice}
                            disabled={loading}
                          />

                          <Input
                            label="UNIT COST PRICE (Rs.) (OPTIONAL)"
                            placeholder="1800.00"
                            type="number"
                            step="0.01"
                            value={formData.costPrice}
                            onChange={(e) => handleChange("costPrice", e.target.value)}
                            error={errors.costPrice}
                            disabled={loading}
                          />

                          {/* Margin display: RP - Cost */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <label style={{
                              fontFamily: theme.typography.labelMd.fontFamily,
                              fontSize: "11px", fontWeight: 600,
                              color: theme.colors.onSurface,
                              textTransform: "uppercase", letterSpacing: "0.05em",
                            }}>MARGIN (RP - COST)</label>
                            <div style={{
                              height: theme.components.formFields.height,
                              padding: "0 10px",
                              borderRadius: theme.rounded.DEFAULT,
                              border: "1.5px solid #cbd5e1",
                              backgroundColor: "#f8fafc",
                              color: (() => {
                                const m = parseFloat(formData.retailPrice) - parseFloat(formData.costPrice);
                                return isNaN(m) || m < 0 ? theme.colors.error : theme.colors.success || "#16a34a";
                              })(),
                              fontSize: "13px", fontWeight: 700,
                              display: "flex", alignItems: "center",
                            }}>
                              {(() => {
                                const rp = parseFloat(formData.retailPrice);
                                const cp = parseFloat(formData.costPrice);
                                if (isNaN(rp) || isNaN(cp)) return "—";
                                const margin = rp - cp;
                                return `Rs. ${margin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <SectionBadge number="2" title="Description & Notes (Optional)" />
                        <Textarea
                          placeholder="Item specifications, compatible e-bike models, warranty notes..."
                          value={formData.others}
                          onChange={(e) => handleChange("others", e.target.value)}
                          disabled={loading}
                          rows={2}
                        />
                      </div>
                    </>
                  ) : (
                    /* Full E-Bike Form */
                    <>
                      {/* Section 1: Model & Classification */}
                      <div>
                        <SectionBadge number="1" title="Model & Classification" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <Input
                            label="MODEL NAME (OPTIONAL)"
                            placeholder="VoltCity Pro V2"
                            value={formData.model}
                            onChange={(e) => handleChange("model", e.target.value)}
                            error={errors.model}
                            disabled={loading}
                          />

                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <label
                              style={{
                                fontFamily: theme.typography.labelMd.fontFamily,
                                fontSize: "11px",
                                fontWeight: 600,
                                color: theme.colors.onSurface,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              CATEGORY
                            </label>
                            <div
                              style={{
                                height: theme.components.formFields.height,
                                padding: "0 10px",
                                borderRadius: theme.rounded.DEFAULT,
                                border: "1.5px solid #cbd5e1",
                                backgroundColor: "#f8fafc",
                                color: theme.colors.primary,
                                fontSize: "13px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              E-Bike
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Electrical & Technical Specs */}
                      <div>
                        <SectionBadge number="2" title="Electrical & Technical Specs" />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                          <Input
                            label="COLOR (OPTIONAL)"
                            placeholder="Matte Black / Large"
                            value={formData.color}
                            onChange={(e) => handleChange("color", e.target.value)}
                            error={errors.color}
                            disabled={loading}
                          />

                          <Input
                            label="BATTERY TYPE (OPTIONAL)"
                            placeholder="Lithium-Ion 48V 15Ah"
                            value={formData.batteryType}
                            onChange={(e) => handleChange("batteryType", e.target.value)}
                            error={errors.batteryType}
                            disabled={loading}
                          />

                          <Input
                            label="VOLT RATING (OPTIONAL)"
                            placeholder="48V"
                            value={formData.volt}
                            onChange={(e) => handleChange("volt", e.target.value)}
                            error={errors.volt}
                            disabled={loading}
                          />

                          <Input
                            label="MFG YEAR (OPTIONAL)"
                            placeholder="2026"
                            type="number"
                            value={formData.manufacturingYear}
                            onChange={(e) => handleChange("manufacturingYear", e.target.value)}
                            error={errors.manufacturingYear}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Section 3: Pricing */}
                      <div>
                        <SectionBadge number="3" title="Pricing" />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                          <Input
                            label="RETAIL PRICE (Rs.) (OPTIONAL)"
                            placeholder="2499.00"
                            type="number"
                            step="0.01"
                            value={formData.retailPrice}
                            onChange={(e) => handleChange("retailPrice", e.target.value)}
                            error={errors.retailPrice}
                            disabled={loading}
                          />

                          <Input
                            label="COST PRICE (Rs.) (OPTIONAL)"
                            placeholder="2200.00"
                            type="number"
                            step="0.01"
                            value={formData.costPrice}
                            onChange={(e) => handleChange("costPrice", e.target.value)}
                            error={errors.costPrice}
                            disabled={loading}
                          />

                          {/* Margin (RP - Cost) — read-only computed display */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <label style={{
                              fontFamily: theme.typography.labelMd.fontFamily,
                              fontSize: "11px", fontWeight: 600,
                              color: theme.colors.onSurface,
                              textTransform: "uppercase", letterSpacing: "0.05em",
                            }}>MARGIN (RP − COST)</label>
                            <div style={{
                              height: theme.components.formFields.height,
                              padding: "0 10px",
                              borderRadius: theme.rounded.DEFAULT,
                              border: "1.5px solid #cbd5e1",
                              backgroundColor: "#f8fafc",
                              color: (() => {
                                const m = parseFloat(formData.retailPrice) - parseFloat(formData.costPrice);
                                return isNaN(m) || m < 0 ? theme.colors.error : "#16a34a";
                              })(),
                              fontSize: "13px", fontWeight: 700,
                              display: "flex", alignItems: "center",
                            }}>
                              {(() => {
                                const rp = parseFloat(formData.retailPrice);
                                const cp = parseFloat(formData.costPrice);
                                if (isNaN(rp) || isNaN(cp)) return "—";
                                const margin = rp - cp;
                                return `Rs. ${margin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Others / Extra Notes */}
                      <div>
                        <SectionBadge number="4" title="Others / Extra Notes (Optional)" />
                        <Textarea
                          placeholder="Additional specs, 2-year warranty included, dealer notes..."
                          value={formData.others}
                          onChange={(e) => handleChange("others", e.target.value)}
                          disabled={loading}
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
          <RefreshCw size={32} color={theme.colors.primary} className="animate-spin" />
        </div>
      }
    >
      <AddEditProductContent />
    </Suspense>
  );
}
