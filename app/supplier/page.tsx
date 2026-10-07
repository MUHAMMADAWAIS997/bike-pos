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
  Badge,
} from "@/components/ui";
import { AddSupplierModal } from "@/components/supplier/add-supplier-modal";
import { useNotification } from "@/components/ui/notification";
import {
  Search,
  Plus,
  Trash2,
  Truck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Receipt,
  History
} from "lucide-react";

export interface SupplierData {
  id: string;
  company: string;
  mobile: string;
  address: string | null;
  created_at: string;
}

export default function SupplierPage() {
  const router = useRouter();
  const { notify } = useNotification();

  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<"newest" | "oldest" | "company_asc" | "company_desc">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Load suppliers from Tauri Rust backend (or web browser fallback)
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: { suppliers: SupplierData[]; total_count: number } = await invoke(
        "get_suppliers",
        {
          search: search.trim(),
          orderBy,
          page: currentPage,
          perPage,
        }
      );
      setSuppliers(res.suppliers || []);
      setTotalCount(res.total_count || 0);
    } catch (err: any) {
      notify(err?.message || "Failed to load suppliers.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, orderBy, currentPage, notify]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Reset page when search or order changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value as any);
    setCurrentPage(1);
  };

  // Delete Supplier Handler
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("delete_supplier", { id: deleteTargetId });
      notify("Supplier deleted successfully.", "success");
      fetchSuppliers();
    } catch (err: any) {
      notify(err?.message || "Failed to delete supplier.", "error");
    } finally {
      setDeleteTargetId(null);
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
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
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
              Suppliers
            </h1>
            <p style={{ margin: "4px 0 0", color: theme.colors.onSurfaceVariant, fontSize: "14px" }}>
              Manage component vendors, manufacturers, and supply partners
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus size={18} />}
          >
            Add Supplier
          </Button>
        </div>

        {/* Filter Controls Card (Blue Scheme) */}
        <Card style={{ backgroundColor: theme.cardSchemes.blue.background, border: `1px solid ${theme.cardSchemes.blue.border}` }}>
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
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: "280px" }}>
              <Input
                placeholder="Search by company, mobile, or address..."
                value={search}
                onChange={handleSearchChange}
                leftIcon={<Search size={16} />}
              />
            </div>

            {/* Order By Select */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={16} color={theme.colors.onSurfaceVariant} />
              <span style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant, fontWeight: 500 }}>
                Sort By:
              </span>
              <select value={orderBy} onChange={handleOrderChange} style={selectStyle}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="company_asc">Company (A - Z)</option>
                <option value="company_desc">Company (Z - A)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Table / Empty State Card */}
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
              Loading supplier records...
            </div>
          ) : suppliers.length === 0 ? (
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
                <Truck size={32} />
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
                  {search ? "No matching suppliers found" : "No Suppliers Yet"}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: theme.colors.onSurfaceVariant,
                    maxWidth: "380px",
                  }}
                >
                  {search
                    ? `No supplier matches "${search}". Try adjusting your search keywords.`
                    : "Your supplier directory is currently empty. Add your first supplier to get started."}
                </p>
              </div>
              {!search && (
                <Button
                  variant="primary"
                  onClick={() => setIsAddModalOpen(true)}
                  leftIcon={<Plus size={18} />}
                >
                  Add First Supplier
                </Button>
              )}
            </div>
          ) : (
            /* Supplier Table */
            <Table>
              <TableHeader>
                <TableRow isHeader>
                  <TableHead>#</TableHead>
                  <TableHead>Company / Supplier Name</TableHead>
                  <TableHead>Mobile No</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead align="center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s, index) => (
                  <TableRow key={s.id}>
                    <TableCell isNumeric style={{ color: theme.colors.onSurfaceVariant }}>
                      {(currentPage - 1) * perPage + index + 1}
                    </TableCell>
                    <TableCell style={{ fontWeight: 600, color: theme.colors.onSurface }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Truck size={16} color={theme.colors.primary} />
                        <span>{s.company}</span>
                      </div>
                    </TableCell>
                    <TableCell isNumeric>{s.mobile}</TableCell>
                    <TableCell style={{ color: theme.colors.onSurfaceVariant }}>
                      {s.address || "-"}
                    </TableCell>
                    <TableCell isNumeric style={{ fontSize: "12px", color: theme.colors.onSurfaceVariant }}>
                      {s.created_at}
                    </TableCell>
                    <TableCell align="center">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/supplier/ledger?company=${encodeURIComponent(s.company)}`)}
                          leftIcon={<History size={14} />}
                          title="View Supplier Ledger & Intake History"
                        >
                          Batches History
                        </Button>
                        <button
                          onClick={() => setDeleteTargetId(s.id)}
                          title="Delete Supplier"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: theme.colors.error,
                            padding: "6px",
                            borderRadius: theme.rounded.DEFAULT,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = theme.colors.errorContainer)
                          }
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

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
                suppliers
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

        {/* Add Supplier Modal */}
        <AddSupplierModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSupplierAdded={fetchSuppliers}
        />

        {/* Delete Confirmation Modal */}
        {deleteTargetId && (
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
            onClick={() => setDeleteTargetId(null)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                backgroundColor: theme.colors.surfaceContainerLowest,
                border: "1px solid #cbd5e1",
                borderRadius: theme.rounded.lg,
                boxShadow: theme.elevation.level2.boxShadow,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: 0, fontSize: "18px", color: theme.colors.onSurface }}>
                Confirm Delete Supplier
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant }}>
                Are you sure you want to delete this supplier record? This action cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                  Cancel
                </Button>
                <Button variant="error" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
