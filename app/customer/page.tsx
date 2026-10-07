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
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { AddCustomerModal } from "@/components/customer/add-customer-modal";
import { useNotification } from "@/components/ui/notification";
import {
  Search,
  Plus,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  Receipt,
  CheckCircle2,
  Clock,
} from "lucide-react";

export interface CustomerData {
  id: string;
  name: string;
  address: string;
  cnic: string;
  mobile: string;
  pending_balance?: number;
  status?: string;
  created_at: string;
}

export default function CustomerPage() {
  const router = useRouter();
  const { notify } = useNotification();

  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Load customers from Tauri Rust backend (or web fallback)
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: { customers: CustomerData[]; total_count: number } = await invoke(
        "get_customers",
        {
          search: search.trim(),
          orderBy,
          page: currentPage,
          perPage,
        }
      );
      setCustomers(res.customers || []);
      setTotalCount(res.total_count || 0);
    } catch (err: any) {
      notify(err?.message || "Failed to load customers.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, orderBy, currentPage, notify]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Reset page when search or order changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value as any);
    setCurrentPage(1);
  };

  // Delete Customer Handler
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("delete_customer", { id: deleteTargetId });

      notify("Customer deleted successfully.", "success");
      fetchCustomers();
    } catch (err: any) {
      notify(err?.message || "Failed to delete customer.", "error");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / perPage) || 1;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          padding: theme.spacing.lg,
          minWidth: 0,
          overflowX: "hidden",
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
              Customers
            </h1>
            <p style={{ margin: "4px 0 0", color: theme.colors.onSurfaceVariant, fontSize: "14px" }}>
              Manage customer records, contact info, and identity verification
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus size={18} />}
          >
            Add Customer
          </Button>
        </div>

        {/* Filter Controls Card (Emerald Scheme) */}
        <Card style={{ backgroundColor: theme.cardSchemes.emerald.background, border: `1px solid ${theme.cardSchemes.emerald.border}` }}>
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
                placeholder="Search by name, mobile, CNIC, or address..."
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
              <select
                value={orderBy}
                onChange={handleOrderChange}
                style={{
                  height: theme.components.formFields.height,
                  padding: "0 12px",
                  borderRadius: theme.rounded.DEFAULT,
                  border: `1px solid ${theme.components.formFields.border}`,
                  backgroundColor: theme.colors.surfaceContainerLowest,
                  color: theme.colors.onSurface,
                  fontSize: "13px",
                  fontFamily: theme.typography.bodyMd.fontFamily,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name (A - Z)</option>
                <option value="name_desc">Name (Z - A)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Customer Table / Empty State Card */}
        <Card style={{ padding: 0, overflow: "hidden", minWidth: 0 }}>
          {loading ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
                fontSize: "14px",
              }}
            >
              Loading customer records...
            </div>
          ) : customers.length === 0 ? (
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
                <Users size={32} />
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
                  {search ? "No matching customers found" : "No Customers Yet"}
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
                    ? `No customer matches "${search}". Try adjusting your search keywords.`
                    : "Your customer directory is currently empty. Add your first customer to get started."}
                </p>
              </div>
              {!search && (
                <Button
                  variant="primary"
                  onClick={() => setIsAddModalOpen(true)}
                  leftIcon={<Plus size={18} />}
                >
                  Add First Customer
                </Button>
              )}
            </div>
          ) : (
            /* Customer Table */
            <div style={{ overflowX: "auto", width: "100%" }}>
              <Table style={{ minWidth: "600px" }}>
                <TableHeader>
                  <TableRow isHeader>
                    <TableHead style={{ width: "40px" }}>#</TableHead>
                    <TableHead style={{ minWidth: "160px" }}>Customer Name</TableHead>
                    <TableHead style={{ minWidth: "130px" }}>Mobile No</TableHead>
                    <TableHead style={{ minWidth: "150px" }}>CNIC No</TableHead>
                    <TableHead style={{ minWidth: "180px" }}>Address</TableHead>
                    <TableHead align="center" style={{ minWidth: "120px" }}>Status</TableHead>
                    <TableHead align="center" style={{ minWidth: "180px" }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c, index) => {
                    const isPending = c.status === "Pending" || (c.pending_balance || 0) > 0.01;
                    return (
                      <TableRow key={c.id}>
                        <TableCell isNumeric style={{ color: theme.colors.onSurfaceVariant }}>
                          {(currentPage - 1) * perPage + index + 1}
                        </TableCell>
                        <TableCell style={{ fontWeight: 600, color: theme.colors.onSurface }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <UserCheck size={16} color={theme.colors.primary} />
                            <span>{c.name}</span>
                          </div>
                        </TableCell>
                        <TableCell isNumeric>{c.mobile}</TableCell>
                        <TableCell isNumeric>{c.cnic}</TableCell>
                        <TableCell
                          style={{
                            color: theme.colors.onSurfaceVariant,
                            maxWidth: "260px",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            lineHeight: "1.4",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={c.address}
                        >
                          {c.address}
                        </TableCell>

                        {/* Status Column */}
                        <TableCell align="center">
                          {isPending ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 700,
                                backgroundColor: "#fff7ed",
                                color: "#c2410c",
                                border: "1px solid #ffedd5",
                              }}
                              title={`Pending Dues: Rs. ${(c.pending_balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                            >
                              <Clock size={13} />
                              Pending
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 700,
                                backgroundColor: "#dcfce7",
                                color: "#15803d",
                                border: "1px solid #86efac",
                              }}
                            >
                              <CheckCircle2 size={13} />
                              Settled
                            </span>
                          )}
                        </TableCell>
                      <TableCell align="center">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/customer/ledger?id=${c.id}`)}
                            leftIcon={<Receipt size={14} />}
                            style={{ padding: "0 10px", height: "30px", fontSize: "12px" }}
                          >
                            View Ledger
                          </Button>

                          <button
                            onClick={() => setDeleteTargetId(c.id)}
                            title="Delete Customer"
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Table Pagination Footer */}
          {!loading && totalCount > 0 && (
            <div
              style={{
                padding: "12px 20px",
                borderTop: `1px solid ${theme.colors.disabledBorder}`,
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
                customers
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

        {/* Add Customer Modal */}
        <AddCustomerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCustomerAdded={fetchCustomers}
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
                border: `1px solid ${theme.colors.outlineVariant}`,
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
                Confirm Delete Customer
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant }}>
                Are you sure you want to delete this customer record? This action cannot be undone.
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
