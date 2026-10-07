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
  Badge,
  Card,
  CardContent,
} from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import {
  Search,
  Plus,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Tag,
  Zap,
  Eye,
  EyeOff,
  Boxes,
  CheckCircle2,
  XCircle,
  Pencil,
} from "lucide-react";

export interface ProductData {
  id: string;
  model: string;
  category: string;
  color: string;
  battery_type: string;
  volt: string;
  manufacturing_year: number;
  initial_quantity: number;
  quantity: number;
  initial_discount: number;
  retail_price: number;
  cost_price: number;
  incentive: number | null;
  others: string | null;
  is_active?: number;
  created_at: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const { notify } = useNotification();

  const [products, setProducts] = useState<ProductData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total_products: 0,
    active_products: 0,
    inactive_products: 0,
    total_categories: 0,
  });
  const [loading, setLoading] = useState(true);

  // Pagination & Filters state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [orderBy, setOrderBy] = useState<"newest" | "oldest" | "model_asc" | "model_desc" | "price_asc" | "price_desc">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  // Toggle active status target
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch products from Tauri Rust backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: {
        products: ProductData[];
        total_count: number;
        models: string[];
        categories: string[];
        stats: {
          total_products: number;
          active_products: number;
          inactive_products: number;
          total_categories: number;
        };
      } = await invoke("get_products", {
        search: search.trim(),
        category: categoryFilter,
        model: modelFilter,
        orderBy,
        statusFilter,
        page: currentPage,
        perPage,
      });

      setProducts(res.products || []);
      setTotalCount(res.total_count || 0);
      if (res.models) setAvailableModels(res.models);
      if (res.categories) setAvailableCategories(res.categories);
      if (res.stats) setStats(res.stats);
    } catch (err: any) {
      notify(err?.message || "Failed to load inventory products.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, modelFilter, orderBy, statusFilter, currentPage, notify]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle soft delete / toggle active status
  const handleToggleStatus = async (productId: string, modelName: string, currentActiveStatus?: number) => {
    setTogglingId(productId);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const newStatus: number = await invoke("toggle_product_status", { id: productId });

      const statusText = newStatus === 1 ? "Active in POS" : "Hidden from POS";
      notify(`Product '${modelName}' is now ${statusText}.`, "success");
      fetchProducts();
    } catch (err: any) {
      notify(err?.message || "Failed to update product status.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / perPage) || 1;

  const selectStyle: React.CSSProperties = {
    height: theme.components.formFields.height,
    padding: "0 10px",
    borderRadius: theme.rounded.DEFAULT,
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: theme.colors.onSurface,
    fontSize: "13px",
    fontFamily: theme.typography.bodyMd.fontFamily,
    outline: "none",
    cursor: "pointer",
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
          <div>
            <h1
              style={{
                fontSize: theme.typography.headlineLg.fontSize,
                fontWeight: theme.typography.headlineLg.fontWeight,
                color: theme.colors.onSurface,
                margin: 0,
              }}
            >
              Product Inventory
            </h1>
            <p style={{ margin: "4px 0 0", color: theme.colors.onSurfaceVariant, fontSize: "14px" }}>
              Track stock levels, specifications, pricing, cost calculations, and incentives
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => router.push("/inventory/add")}
            leftIcon={<Plus size={18} />}
          >
            Add Product
          </Button>
        </div>

        {/* Financial Stat Cards (Blue, Emerald, Amber, Purple Schemes) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <Card style={{ backgroundColor: theme.cardSchemes.blue.background, border: `1px solid ${theme.cardSchemes.blue.border}` }}>
            <CardContent style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.blue.text, fontWeight: 700, textTransform: "uppercase" }}>
                Total Catalog Products
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: theme.cardSchemes.blue.titleText, marginTop: "4px" }}>
                {stats.total_products} Models
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.emerald.background, border: `1px solid ${theme.cardSchemes.emerald.border}` }}>
            <CardContent style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.emerald.text, fontWeight: 700, textTransform: "uppercase" }}>
                Active in POS
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: theme.cardSchemes.emerald.titleText, marginTop: "4px" }}>
                {stats.active_products} Models
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.amber.background, border: `1px solid ${theme.cardSchemes.amber.border}` }}>
            <CardContent style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.amber.text, fontWeight: 700, textTransform: "uppercase" }}>
                Inactive / Hidden
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: theme.cardSchemes.amber.titleText, marginTop: "4px" }}>
                {stats.inactive_products} Models
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.purple.background, border: `1px solid ${theme.cardSchemes.purple.border}` }}>
            <CardContent style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.purple.text, fontWeight: 700, textTransform: "uppercase" }}>
                Total Categories
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: theme.cardSchemes.purple.titleText, marginTop: "4px" }}>
                {stats.total_categories} Categories
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls Card (Purple Scheme) */}
        <Card style={{ backgroundColor: theme.cardSchemes.purple.background, border: `1px solid ${theme.cardSchemes.purple.border}` }}>
          <CardContent
            style={{
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Search Bar */}
            <div style={{ flex: 1, minWidth: "240px" }}>
              <Input
                placeholder="Search by model, specs, color, or battery..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={<Search size={16} />}
              />
            </div>

            {/* Filters Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              {/* Status Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Boxes size={15} color={theme.colors.onSurfaceVariant} />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  style={selectStyle}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive / Hidden</option>
                </select>
              </div>

              {/* Category Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Layers size={15} color={theme.colors.onSurfaceVariant} />
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={selectStyle}
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Tag size={15} color={theme.colors.onSurfaceVariant} />
                <select
                  value={modelFilter}
                  onChange={(e) => {
                    setModelFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={selectStyle}
                >
                  <option value="all">All Models</option>
                  {availableModels.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order By Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Filter size={15} color={theme.colors.onSurfaceVariant} />
                <select
                  value={orderBy}
                  onChange={(e) => {
                    setOrderBy(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  style={selectStyle}
                >
                  <option value="oldest">Oldest First</option>
                  <option value="model_asc">Model (A to Z)</option>
                  <option value="model_desc">Model (Z to A)</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Data Table Container with Horizontal & Vertical Scrolling */}
        <Card style={{ padding: 0, overflow: "hidden", border: "1.5px solid #cbd5e1" }}>
          <div style={{ width: "100%" }}>
            {loading ? (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  color: theme.colors.onSurfaceVariant,
                  fontSize: "14px",
                }}
              >
                Loading inventory products...
              </div>
            ) : products.length === 0 ? (
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
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: theme.colors.surfaceContainerHigh,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.colors.primary,
                  }}
                >
                  <Package size={32} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: "0 0 6px",
                      fontSize: "18px",
                      fontWeight: 600,
                      color: theme.colors.onSurface,
                    }}
                  >
                    {search || categoryFilter !== "all" || modelFilter !== "all"
                      ? "No matching products found"
                      : "No Products Yet"}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: theme.colors.onSurfaceVariant,
                      maxWidth: "380px",
                    }}
                  >
                    {search || categoryFilter !== "all" || modelFilter !== "all"
                      ? "No product matches your filter criteria. Try resetting search or category filters."
                      : "Your inventory directory is empty. Add your first product to start tracking stock."}
                  </p>
                </div>
                {!search && categoryFilter === "all" && modelFilter === "all" && (
                  <Button
                    variant="primary"
                    onClick={() => router.push("/inventory/add")}
                    leftIcon={<Plus size={18} />}
                  >
                    Add First Product
                  </Button>
                )}
              </div>
            ) : (
              /* Products Data Table with Horizontal & Vertical Scroll */
              <Table maxHeight="560px" containerStyle={{ border: "none", borderRadius: 0 }}>
                <TableHeader style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <TableRow isHeader style={{ backgroundColor: "#f8fafc" }}>
                    <TableHead sticky>#</TableHead>
                    <TableHead sticky>Model Name</TableHead>
                    <TableHead sticky>Category</TableHead>
                    <TableHead sticky>Color / Volt</TableHead>
                    <TableHead sticky>Battery Type</TableHead>
                    <TableHead sticky align="center">Year</TableHead>
                    <TableHead sticky align="center">Stock Qty</TableHead>
                    <TableHead sticky align="right">Retail Price</TableHead>
                    <TableHead sticky align="right">Cost Price</TableHead>
                    <TableHead sticky align="center">POS Status</TableHead>
                    <TableHead sticky align="center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p, index) => {
                    const isActive = p.is_active !== 0;
                    const isToggling = togglingId === p.id;

                    return (
                      <TableRow key={p.id} style={{ borderBottom: "1px solid #e2e8f0", opacity: isActive ? 1 : 0.7 }}>
                        <TableCell isNumeric style={{ color: theme.colors.onSurfaceVariant }}>
                          {(currentPage - 1) * perPage + index + 1}
                        </TableCell>
                        <TableCell style={{ fontWeight: 600, color: theme.colors.onSurface }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Zap size={16} color={isActive ? theme.colors.primary : "#94a3b8"} />
                            <span style={{ textDecoration: isActive ? "none" : "line-through" }}>{p.model}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="primary">{p.category}</Badge>
                        </TableCell>
                        <TableCell style={{ color: theme.colors.onSurfaceVariant }}>
                          {p.color} ({p.volt})
                        </TableCell>
                        <TableCell style={{ color: theme.colors.onSurfaceVariant }}>
                          {p.battery_type}
                        </TableCell>
                        <TableCell align="center" isNumeric>
                          {p.manufacturing_year}
                        </TableCell>
                        <TableCell align="center" isNumeric>
                          <Badge
                            variant={p.quantity > 5 ? "success" : p.quantity > 0 ? "secondary" : "error"}
                          >
                            {p.quantity} Units
                          </Badge>
                        </TableCell>
                        <TableCell align="right" isNumeric style={{ fontWeight: 700 }}>
                          {p.retail_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right" isNumeric style={{ fontWeight: 600, color: theme.colors.onSurface }}>
                          {(p.cost_price || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center">
                          {isActive ? (
                            <Badge variant="success" style={{ display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer" }} onClick={() => handleToggleStatus(p.id, p.model, p.is_active)}>
                              <CheckCircle2 size={12} /> Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", cursor: "pointer" }} onClick={() => handleToggleStatus(p.id, p.model, p.is_active)}>
                              <XCircle size={12} /> Hidden
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <button
                            type="button"
                            onClick={() => router.push(`/inventory/add?id=${p.id}`)}
                            title="Edit Product"
                            style={{
                              padding: "6px 10px",
                              borderRadius: theme.rounded.md,
                              border: `1px solid ${theme.colors.outlineVariant}`,
                              backgroundColor: "#f8fafc",
                              color: theme.colors.primary,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                              fontSize: "12px",
                              fontWeight: 600,
                              transition: "all 0.15s ease",
                            }}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Table Pagination Footer */}
          {!loading && totalCount > 0 && (
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: theme.colors.surfaceContainerLowest,
                fontSize: "13px",
                fontFamily: theme.typography.labelMd.fontFamily,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              <div>
                Showing{" "}
                <span style={{ fontWeight: 600, color: theme.colors.onSurface }}>
                  {(currentPage - 1) * perPage + 1}
                </span>{" "}
                to{" "}
                <span style={{ fontWeight: 600, color: theme.colors.onSurface }}>
                  {Math.min(currentPage * perPage, totalCount)}
                </span>{" "}
                of{" "}
                <span style={{ fontWeight: 600, color: theme.colors.onSurface }}>{totalCount}</span>{" "}
                products
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
                <span style={{ fontSize: "13px", fontWeight: 600, padding: "0 4px" }}>
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
