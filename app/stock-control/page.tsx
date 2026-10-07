"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Boxes,
  Plus,
} from "lucide-react";
import { StockStatCards } from "@/components/stock/stock-stat-cards";

export interface StockInventoryEntry {
  id: string;
  product_id: string;
  product_model: string;
  category: string;
  color: string;
  supplier_company: string;
  batch_no: string;
  stock_qty: number;
  total_product_stock: number;
  rate_count: number;
  retail_price: number;
  discount: number;
  cost_price: number;
  unit_margin: number;
  total_profit: number;
  created_at: string;
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

export default function StockControlPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const initialDates = getInitialDates();

  const [entries, setEntries] = useState<StockInventoryEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter options
  const [supplierOptions, setSupplierOptions] = useState<string[]>([]);
  const [productOptions, setProductOptions] = useState<{ id: string; model: string }[]>([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const fetchAvailableStock = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: any = await invoke("get_available_stock_inventory", {
        search: search.trim(),
        supplier: selectedSupplier,
        productId: selectedProduct,
        startDate,
        endDate,
        page: currentPage,
        perPage,
      });

      setEntries(res.entries || []);
      setTotalCount(res.total_count || 0);
      if (res.suppliers) setSupplierOptions(res.suppliers);
      if (res.products) setProductOptions(res.products);
    } catch (err: any) {
      notify(err?.message || "Failed to load stock inventory.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, selectedSupplier, selectedProduct, startDate, endDate, currentPage, notify]);

  useEffect(() => {
    fetchAvailableStock();
  }, [fetchAvailableStock]);

  const selectStyle: React.CSSProperties = {
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
  };

  const totalPages = Math.ceil(totalCount / perPage) || 1;

  const stockStats = React.useMemo(() => {
    const currentCost = entries.reduce((s, i) => s + (i.cost_price || 0) * (i.stock_qty || 0), 0);
    const estimatedRevenue = entries.reduce((s, i) => s + (i.retail_price || 0) * (i.stock_qty || 0), 0);
    const totalQuantity = entries.reduce((s, i) => s + (i.stock_qty || 0), 0);
    const estimatedProfit = entries.reduce((s, i) => s + (i.total_profit || (i.retail_price - i.cost_price) * i.stock_qty), 0);
    const totalModels = entries.length;
    const marginPercent = currentCost > 0 ? (estimatedProfit / currentCost) * 100 : 0;

    return {
      currentCost,
      estimatedRevenue,
      totalQuantity,
      estimatedProfit,
      totalModels,
      marginPercent,
    };
  }, [entries]);

  const handleExportCSV = () => {
    notify("Exporting Stock Inventory to CSV format...", "info");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: theme.spacing.lg,
          maxWidth: "1340px",
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.lg,
        }}
      >
        {/* Header Bar matching Image */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Boxes size={24} color={theme.colors.primary} />
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: theme.colors.onSurface,
                margin: 0,
              }}
            >
              Available Stock Inventory
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <Button
              variant="primary"
              onClick={() => router.push("/stock-control/add")}
              leftIcon={<Plus size={16} />}
            >
              Receive Stock
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              leftIcon={<Download size={15} />}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              leftIcon={<Printer size={15} />}
            >
              Print
            </Button>
          </div>
        </div>

        {/* Multi-Variant KPI Stat Cards */}
        <StockStatCards stats={stockStats} />

        {/* Filter Controls Row matching Image */}
        <Card style={{ border: "1px solid #cbd5e1" }}>
          <CardContent
            style={{
              padding: "16px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              alignItems: "center",
            }}
          >
            {/* Search Input */}
            <Input
              placeholder="Product name, invoice..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search size={16} />}
            />

            {/* Supplier Filter */}
            <select
              value={selectedSupplier}
              onChange={(e) => {
                setSelectedSupplier(e.target.value);
                setCurrentPage(1);
              }}
              style={selectStyle}
            >
              <option value="all">All Suppliers</option>
              {supplierOptions.map((supp) => (
                <option key={supp} value={supp}>
                  {supp}
                </option>
              ))}
            </select>

            {/* Product Filter */}
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setCurrentPage(1);
              }}
              style={selectStyle}
            >
              <option value="all">All Products</option>
              {productOptions.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.model}
                </option>
              ))}
            </select>

            {/* Start Date */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              style={selectStyle}
            />

            {/* End Date */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              style={selectStyle}
            />
          </CardContent>
        </Card>

        {/* Stock Inventory Table matching Image */}
        <Card style={{ padding: 0, overflow: "hidden", border: "1px solid #cbd5e1" }}>
          {loading ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
                fontSize: "14px",
              }}
            >
              Loading available stock entries...
            </div>
          ) : entries.length === 0 ? (
            /* Empty State */
            <div
              style={{
                padding: "60px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "16px",
              }}
            >
              <Boxes size={36} color={theme.colors.onSurfaceVariant} />
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 600, color: theme.colors.onSurface }}>
                  No available stock entries found
                </h3>
                <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant, maxWidth: "380px" }}>
                  Intake supplier stock deliveries to view item rates, margin calculation, and batch inventory.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => router.push("/stock-control/add")}
                leftIcon={<Plus size={18} />}
              >
                Receive First Stock Delivery
              </Button>
            </div>
          ) : (
            /* Table matching Image */
            <Table>
              <TableHeader>
                <TableRow isHeader style={{ backgroundColor: "#f8fafc" }}>
                  <TableHead style={{ fontSize: "11px", letterSpacing: "0.05em", color: "#64748b" }}>
                    PRODUCT NAME & SPECS
                  </TableHead>
                  <TableHead style={{ fontSize: "11px", letterSpacing: "0.05em", color: "#64748b" }}>
                    SUPPLIER
                  </TableHead>
                  <TableHead align="center" style={{ fontSize: "11px", letterSpacing: "0.05em", color: "#64748b" }}>
                    STOCK QTY
                  </TableHead>
                  <TableHead align="right" style={{ fontSize: "11px", letterSpacing: "0.05em", color: "#64748b" }}>
                    RETAIL (PKR)
                  </TableHead>
                  <TableHead align="right" style={{ fontSize: "11px", letterSpacing: "0.05em", color: "#64748b" }}>
                    MARGIN (PKR)
                  </TableHead>
                  <TableHead align="right" style={{ fontSize: "11px", letterSpacing: "0.05em", color: "#64748b" }}>
                    COST (PKR)
                  </TableHead>
                  <TableHead align="right" style={{ fontSize: "11px", letterSpacing: "0.05em", color: "#64748b" }}>
                    UNIT MARGIN
                  </TableHead>
                  <TableHead align="right" style={{ fontSize: "11px", letterSpacing: "0.05em", color: "#64748b" }}>
                    TOTAL PROFIT
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((item) => (
                  <TableRow key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    {/* Product Name & Specs */}
                    <TableCell>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>
                          {item.product_model}
                        </span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          Type: {item.category} {item.color ? `| ${item.color}` : ""}
                        </span>
                      </div>
                    </TableCell>

                    {/* Supplier */}
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#334155" }}>
                        <Building2 size={15} color="#475569" />
                        <span style={{ fontWeight: 600, fontSize: "13px" }}>{item.supplier_company}</span>
                      </div>
                    </TableCell>

                    {/* Stock Qty Pill & Rates Counter */}
                    <TableCell align="center">
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        {/* Blue Batch Qty Pill */}
                        <div
                          style={{
                            minWidth: "32px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            backgroundColor: "#e0f2fe",
                            color: "#0369a1",
                            fontWeight: 700,
                            fontSize: "13px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.stock_qty}
                        </div>

                        {/* Yellow Multi-rate Pill if product has multiple active rates */}
                        {item.rate_count > 1 && (
                          <div
                            style={{
                              padding: "2px 8px",
                              borderRadius: "10px",
                              backgroundColor: "#fef9c3",
                              border: "1px solid #fde047",
                              color: "#854d0e",
                              fontWeight: 600,
                              fontSize: "11px",
                            }}
                          >
                            Total: {item.total_product_stock} ({item.rate_count} rates)
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Retail Price */}
                    <TableCell align="right" style={{ fontWeight: 700, fontSize: "13.5px", color: "#0f172a" }}>
                      Rs. {item.retail_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>

                    {/* Margin (RP - Cost) */}
                    <TableCell align="right" style={{ fontWeight: 700, fontSize: "13px", color: "#16a34a" }}>
                      Rs. {item.discount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>

                    {/* Cost Price */}
                    <TableCell align="right" style={{ fontWeight: 600, fontSize: "13.5px", color: "#334155" }}>
                      Rs. {item.cost_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>

                    {/* Unit Margin (Green) */}
                    <TableCell align="right" style={{ fontWeight: 700, fontSize: "13.5px", color: "#16a34a" }}>
                      + Rs. {item.unit_margin.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>

                    {/* Total Profit (Bold Green) */}
                    <TableCell align="right" style={{ fontWeight: 800, fontSize: "14px", color: "#15803d" }}>
                      Rs. {item.total_profit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Table Footer matching Image */}
          {!loading && totalCount > 0 && (
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#ffffff",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              <div>
                Showing <strong style={{ color: "#0f172a" }}>{(currentPage - 1) * perPage + 1}</strong> to{" "}
                <strong style={{ color: "#0f172a" }}>{Math.min(currentPage * perPage, totalCount)}</strong> of{" "}
                <strong style={{ color: "#0f172a" }}>{totalCount}</strong> stock entries
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  leftIcon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  rightIcon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
