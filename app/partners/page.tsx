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
import { AddPartnerModal } from "@/components/partner/add-partner-modal";
import { useNotification } from "@/components/ui/notification";
import {
  Search,
  Plus,
  Trash2,
  Handshake,
  ChevronLeft,
  ChevronRight,
  Filter,
  PieChart,
  Percent,
  Eye,
} from "lucide-react";

export interface PartnerData {
  id: string;
  name: string;
  mobile: string;
  equity_share: number;
  color_key: string;
  created_at: string;
}

export default function PartnersPage() {
  const router = useRouter();
  const { notify } = useNotification();

  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAllocatedEquity, setTotalAllocatedEquity] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<"newest" | "oldest" | "name_asc" | "equity_desc">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [summaryPartner, setSummaryPartner] = useState<PartnerData | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Load partners from Tauri Rust backend (or web fallback)
  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: {
        partners: PartnerData[];
        total_count: number;
        total_allocated_equity: number;
      } = await invoke("get_partners", {
        search: search.trim(),
        orderBy,
        page: currentPage,
        perPage,
      });
      setPartners(res.partners || []);
      setTotalCount(res.total_count || 0);
      setTotalAllocatedEquity(res.total_allocated_equity || 0);
    } catch (err: any) {
      notify(err?.message || "Failed to load partners directory.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, orderBy, currentPage, notify]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Delete partner handler
  const handleDeletePartner = async () => {
    if (!deleteTargetId) return;

    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("delete_partner", { id: deleteTargetId });

      notify("Partner deleted successfully.", "success");
      setDeleteTargetId(null);
      fetchPartners();
    } catch (err: any) {
      notify(err?.message || "Failed to delete partner.", "error");
    }
  };

  const totalPages = Math.ceil(totalCount / perPage) || 1;
  const availableEquity = Math.max(0, 100 - totalAllocatedEquity);

  const selectStyle: React.CSSProperties = {
    height: "36px",
    padding: "0 12px",
    borderRadius: theme.rounded.DEFAULT,
    border: "1.5px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: 600,
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
              Partners Directory
            </h1>
            <p
              style={{
                fontSize: theme.typography.bodyMd.fontSize,
                color: theme.colors.onSurfaceVariant,
                margin: "4px 0 0",
              }}
            >
              Manage business partners, equity shares, and partner profiles
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus size={18} />}
          >
            Add Partner
          </Button>
        </div>

        {/* Financial Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <Card style={{ backgroundColor: theme.cardSchemes.blue.background, border: `1px solid ${theme.cardSchemes.blue.border}` }}>
            <CardContent style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.blue.text, fontWeight: 700, textTransform: "uppercase" }}>
                Total Partners
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: theme.cardSchemes.blue.titleText, marginTop: "4px" }}>
                {totalCount}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.purple.background, border: `1px solid ${theme.cardSchemes.purple.border}` }}>
            <CardContent style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.purple.text, fontWeight: 700, textTransform: "uppercase" }}>
                Allocated Equity
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: theme.cardSchemes.purple.titleText, marginTop: "4px" }}>
                {totalAllocatedEquity.toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.emerald.background, border: `1px solid ${theme.cardSchemes.emerald.border}` }}>
            <CardContent style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.emerald.text, fontWeight: 700, textTransform: "uppercase" }}>
                Available Equity
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: theme.cardSchemes.emerald.titleText, marginTop: "4px" }}>
                {availableEquity.toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardSchemes.amber.background, border: `1px solid ${theme.cardSchemes.amber.border}` }}>
            <CardContent style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", color: theme.cardSchemes.amber.text, fontWeight: 700, textTransform: "uppercase" }}>
                Allocation Status
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: totalAllocatedEquity <= 100 ? theme.cardSchemes.amber.accent : "#dc2626", marginTop: "8px" }}>
                {totalAllocatedEquity <= 100 ? "Healthy Allocation" : "Over-allocated"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls Row (Slate Scheme) */}
        <Card style={{ backgroundColor: theme.cardSchemes.slate.background, border: `1px solid ${theme.cardSchemes.slate.border}` }}>
          <CardContent
            style={{
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1, maxWidth: "420px" }}>
              <Input
                placeholder="Search partners by name or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={<Search size={16} />}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Filter size={16} color={theme.colors.onSurfaceVariant} />
              <span style={{ fontSize: "13px", color: theme.colors.onSurfaceVariant, fontWeight: 500 }}>
                Order By:
              </span>
              <select
                value={orderBy}
                onChange={(e) => {
                  setOrderBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                style={selectStyle}
              >
                <option value="newest" style={{ backgroundColor: "#ffffff", color: "#0f172a" }}>Newest First</option>
                <option value="oldest" style={{ backgroundColor: "#ffffff", color: "#0f172a" }}>Oldest First</option>
                <option value="name_asc" style={{ backgroundColor: "#ffffff", color: "#0f172a" }}>Name (A to Z)</option>
                <option value="equity_desc" style={{ backgroundColor: "#ffffff", color: "#0f172a" }}>Equity (High to Low)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Partners Data Table */}
        <Card style={{ padding: 0, overflow: "hidden", border: "1.5px solid #cbd5e1" }}>
          {loading ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: theme.colors.onSurfaceVariant, fontSize: "14px" }}>
              Loading partners directory...
            </div>
          ) : partners.length === 0 ? (
            <div style={{ padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "16px" }}>
              <Handshake size={36} color={theme.colors.onSurfaceVariant} />
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 600, color: theme.colors.onSurface }}>
                  {search ? "No matching partners found" : "No Partners Yet"}
                </h3>
                <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant, maxWidth: "380px" }}>
                  {search ? `No partner matches "${search}". Try adjusting your keywords.` : "Your partner directory is currently empty. Add your first partner to track equity shares."}
                </p>
              </div>
              {!search && (
                <Button variant="primary" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus size={18} />}>
                  Add First Partner
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow isHeader style={{ backgroundColor: "#f8fafc" }}>
                  <TableHead>#</TableHead>
                  <TableHead>Partner Name</TableHead>
                  <TableHead>Mobile No</TableHead>
                  <TableHead align="center">Equity Share (%)</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead align="center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((p, index) => (
                  <TableRow key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <TableCell isNumeric style={{ color: theme.colors.onSurfaceVariant }}>
                      {(currentPage - 1) * perPage + index + 1}
                    </TableCell>

                    <TableCell style={{ fontWeight: 600, color: theme.colors.onSurface }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Handshake size={16} color={theme.colors.primary} />
                        <span>{p.name}</span>
                      </div>
                    </TableCell>

                    <TableCell isNumeric style={{ fontWeight: 600, color: "#334155" }}>
                      {p.mobile}
                    </TableCell>

                    <TableCell align="center">
                      <div
                        style={{
                          display: "inline-flex",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          backgroundColor: "#e0f2fe",
                          color: "#0369a1",
                          fontWeight: 700,
                          fontSize: "13px",
                        }}
                      >
                        {p.equity_share.toFixed(2)}%
                      </div>
                    </TableCell>

                    <TableCell isNumeric style={{ fontSize: "12px", color: theme.colors.onSurfaceVariant }}>
                      {p.created_at}
                    </TableCell>

                    <TableCell align="center">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/partners/summary?id=${p.id}`)}
                          leftIcon={<Eye size={15} color={theme.colors.primary} />}
                        >
                          View Summary
                        </Button>

                        <button
                          onClick={() => setDeleteTargetId(p.id)}
                          title="Delete Partner"
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
                          }}
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

          {/* Table Footer Pagination */}
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
                <strong style={{ color: "#0f172a" }}>{totalCount}</strong> partners
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

        {/* Add Partner Modal */}
        <AddPartnerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchPartners}
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
                maxWidth: "400px",
                backgroundColor: theme.colors.surfaceContainerLowest,
                border: "1px solid #cbd5e1",
                borderRadius: theme.rounded.lg,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: 0, fontSize: "16px", color: theme.colors.onSurface }}>
                Confirm Delete Partner
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant }}>
                Are you sure you want to delete this partner record? This action cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                  Cancel
                </Button>
                <Button variant="primary" style={{ backgroundColor: theme.colors.error, borderColor: theme.colors.error }} onClick={handleDeletePartner}>
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
