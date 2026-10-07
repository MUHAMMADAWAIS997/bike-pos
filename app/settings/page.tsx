"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { theme } from "@/lib/theme";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Switch,
  Badge,
} from "@/components/ui";
import { useNotification } from "@/components/ui/notification";
import {
  Store,
  Lock,
  Save,
  CheckCircle2,
  Phone,
  MapPin,
  Mail,
  Tag,
  ShieldCheck,
  Building,
  Eye,
  EyeOff,
  RefreshCw,
  Printer,
  Database,
  FolderOpen,
  RotateCcw,
  Clock,
  HardDrive,
  Zap,
  FileText,
  Play,
  AlertTriangle,
} from "lucide-react";

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
  backup_dir?: string;
  low_stock_threshold?: number;
  updated_at: string;
}

export interface BackupFileRecord {
  filename: string;
  full_path: string;
  size_bytes: number;
  created_at: string;
}

export interface BackupInfoData {
  backup_dir: string;
  total_backups: number;
  backups: BackupFileRecord[];
}

export default function SettingsPage() {
  const { notify } = useNotification();

  // Shop & Invoice Header State
  const [shopSettings, setShopSettings] = useState<ShopSettingsData>({
    id: "default",
    shop_name: "BKM MOTORS",
    tagline: "Deal in Environment Friendly Bikes",
    address: "Main Showroom, Motorway City, Pakistan",
    phone: "0304-8799010",
    email: "info@bkmmotors.com",
    brand_name: "REVOO",
    brand_tagline: "ELECTRIC MOTORCYCLE BRAND",
    default_printer: "",
    auto_show_receipt: true,
    silent_printing: false,
    backup_dir: "",
    low_stock_threshold: 2,
    updated_at: "",
  });

  const [loadingShop, setLoadingShop] = useState(true);
  const [savingShop, setSavingShop] = useState(false);

  // Printer Detection State
  const [detectedPrinters, setDetectedPrinters] = useState<string[]>([]);
  const [detectingPrinters, setDetectingPrinters] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [autoShowReceipt, setAutoShowReceipt] = useState(true);
  const [silentPrinting, setSilentPrinting] = useState(false);
  const [savingPrinter, setSavingPrinter] = useState(false);

  // Backup & Restore State
  const [backupInfo, setBackupInfo] = useState<BackupInfoData | null>(null);
  const [loadingBackupInfo, setLoadingBackupInfo] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringDb, setRestoringDb] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  // Fetch current shop settings on mount
  const fetchSettings = useCallback(async () => {
    setLoadingShop(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: ShopSettingsData = await invoke("get_shop_settings");
      if (res) {
        setShopSettings(res);
        if (res.default_printer) setSelectedPrinter(res.default_printer);
        if (typeof res.auto_show_receipt === "boolean") setAutoShowReceipt(res.auto_show_receipt);
        if (typeof res.silent_printing === "boolean") setSilentPrinting(res.silent_printing);
      }
    } catch (err: any) {
      console.error("Failed to load shop settings", err);
    } finally {
      setLoadingShop(false);
    }
  }, []);

  // Fetch backup info
  const fetchBackupInfo = useCallback(async () => {
    setLoadingBackupInfo(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const res: BackupInfoData = await invoke("get_backup_info");
      setBackupInfo(res);
    } catch (err: any) {
      console.error("Failed to load backup info", err);
    } finally {
      setLoadingBackupInfo(false);
    }
  }, []);

  // Detect available system printers on Windows
  const handleDetectPrinters = async (silent: boolean = false) => {
    setDetectingPrinters(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const list: string[] = await invoke("get_available_printers");
      setDetectedPrinters(list || []);
      if (list && list.length > 0) {
        if (!silent) {
          notify(`Detected ${list.length} installed printers on your system!`, "success");
        }
        if (!selectedPrinter) {
          setSelectedPrinter(list[0]);
        }
      } else {
        if (!silent) {
          notify("No installed system printers found.", "warning");
        }
      }
    } catch (err: any) {
      if (!silent) {
        notify(err?.toString() || "Failed to detect printers.", "error");
      }
    } finally {
      setDetectingPrinters(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchBackupInfo();
    handleDetectPrinters(true);
  }, [fetchSettings, fetchBackupInfo]);

  // Save Shop Settings
  const handleSaveShopSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopSettings.shop_name.trim() || !shopSettings.phone.trim()) {
      notify("Shop Name and Phone number are required.", "error");
      return;
    }

    setSavingShop(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const updated: ShopSettingsData = await invoke("update_shop_settings", {
        shopName: shopSettings.shop_name,
        tagline: shopSettings.tagline,
        address: shopSettings.address,
        phone: shopSettings.phone,
        email: shopSettings.email,
        brandName: shopSettings.brand_name,
        brandTagline: shopSettings.brand_tagline,
        defaultPrinter: selectedPrinter,
        autoShowReceipt,
        silentPrinting,
        backupDir: shopSettings.backup_dir || null,
        lowStockThreshold: Number(shopSettings.low_stock_threshold) || 2,
      });

      setShopSettings(updated);
      notify("Shop & Invoice header settings saved successfully!", "success");
    } catch (err: any) {
      console.error("Save shop settings failed", err);
      notify(err?.toString() || "Failed to save shop settings.", "error");
    } finally {
      setSavingShop(false);
    }
  };

  // Save Default Printer & Print Automation Settings
  const handleSavePrinterSettings = async () => {
    setSavingPrinter(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const updated: ShopSettingsData = await invoke("update_shop_settings", {
        shopName: shopSettings.shop_name,
        tagline: shopSettings.tagline,
        address: shopSettings.address,
        phone: shopSettings.phone,
        email: shopSettings.email,
        brandName: shopSettings.brand_name,
        brandTagline: shopSettings.brand_tagline,
        defaultPrinter: selectedPrinter,
        autoShowReceipt,
        silentPrinting,
        backupDir: shopSettings.backup_dir || null,
        lowStockThreshold: Number(shopSettings.low_stock_threshold) || 2,
      });

      setShopSettings(updated);
      notify("Printer & receipt automation settings saved successfully!", "success");
    } catch (err: any) {
      notify("Failed to save printer configuration.", "error");
    } finally {
      setSavingPrinter(false);
    }
  };

  // Test Printer Trigger
  const handleTestPrint = () => {
    if (typeof window !== "undefined") {
      notify(
        `Triggering test print on "${selectedPrinter || "Default System Printer"}"...`,
        "info"
      );
      window.print();
    }
  };


  // Select Backup Folder
  const handleSelectBackupFolder = async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const folder: string = await invoke("select_backup_directory");
      if (folder) {
        notify(`Backup directory updated to: ${folder}`, "success");
        fetchBackupInfo();
        fetchSettings();
      }
    } catch (err: any) {
      if (!err?.toString()?.includes("cancelled")) {
        notify("Failed to select backup directory.", "error");
      }
    }
  };

  // Create Manual Backup Now
  const handleCreateBackupNow = async () => {
    setCreatingBackup(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const path: string = await invoke("create_database_backup");
      notify(`Backup created successfully: ${path}`, "success");
      fetchBackupInfo();
    } catch (err: any) {
      notify(err?.toString() || "Failed to create database backup.", "error");
    } finally {
      setCreatingBackup(false);
    }
  };

  // Restore Database from File
  const handleRestoreDatabase = async (filePath?: string) => {
    if (!confirm("Are you sure you want to restore the database? Current data will be safely backed up before restoring.")) {
      return;
    }

    setRestoringDb(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const msg: string = await invoke("restore_database_from_file", {
        backupPath: filePath || null,
      });
      notify(msg || "Database restored successfully!", "success");
      fetchBackupInfo();
    } catch (err: any) {
      if (!err?.toString()?.includes("cancelled")) {
        notify(err?.toString() || "Failed to restore database.", "error");
      }
    } finally {
      setRestoringDb(false);
    }
  };

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      notify("Please fill all password fields.", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      notify("New password and confirm password do not match.", "warning");
      return;
    }

    if (newPassword.length < 4) {
      notify("New password must be at least 4 characters long.", "warning");
      return;
    }

    setUpdatingPass(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const msg: string = await invoke("update_user_password", {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      notify(msg || "Password updated successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Update password failed", err);
      notify(err?.toString() || "Failed to update password. Verify current password.", "error");
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontFamily: theme.typography.display.fontFamily,
              fontSize: theme.typography.headlineLg.fontSize,
              fontWeight: theme.typography.headlineLg.fontWeight,
              color: theme.colors.onSurface,
              margin: "0 0 4px 0",
            }}
          >
            System Settings
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: theme.colors.onSurfaceVariant }}>
            Configure your shop details, default desktop printer, database auto-backups, and security.
          </p>
        </div>

        {/* 2-Column Grid Layout for Settings Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>

          {/* CARD 1: Shop & Invoice Header Details (Blue Scheme) */}
          <Card style={{ backgroundColor: theme.cardSchemes.blue.background, borderRadius: theme.rounded.xl, border: `1px solid ${theme.cardSchemes.blue.border}` }}>
            <CardHeader style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.cardSchemes.blue.headerBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                  <Store size={22} color={theme.cardSchemes.blue.accent} style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <CardTitle style={{ fontSize: "16px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: theme.cardSchemes.blue.titleText }}>
                      Shop Details & Invoice Header
                    </CardTitle>
                    <p style={{ fontSize: "12px", color: theme.cardSchemes.blue.text, margin: "2px 0 0 0" }}>
                      Customize store header shown on printed invoices & receipts.
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent style={{ padding: "20px" }}>
              {loadingShop ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: theme.colors.onSurfaceVariant }}>
                  <RefreshCw size={20} className="animate-spin" color={theme.colors.primary} style={{ margin: "0 auto 8px" }} />
                  <p style={{ margin: 0, fontSize: "13px" }}>Loading shop configuration...</p>
                </div>
              ) : (
                <form onSubmit={handleSaveShopSettings} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    {/* Shop Name */}
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                        Shop Name <span style={{ color: theme.colors.error }}>*</span>
                      </label>
                      <Input
                        value={shopSettings.shop_name}
                        onChange={(e) => setShopSettings({ ...shopSettings, shop_name: e.target.value })}
                        placeholder="e.g. BKM MOTORS"
                        leftIcon={<Building size={15} color={theme.colors.onSurfaceVariant} />}
                        required
                      />
                    </div>

                    {/* Tagline */}
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                        Tagline / Slogan
                      </label>
                      <Input
                        value={shopSettings.tagline}
                        onChange={(e) => setShopSettings({ ...shopSettings, tagline: e.target.value })}
                        placeholder="e.g. Deal in Environment Friendly Bikes"
                        leftIcon={<Tag size={15} color={theme.colors.onSurfaceVariant} />}
                      />
                    </div>

                    {/* Address */}
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                        Showroom Address
                      </label>
                      <Input
                        value={shopSettings.address}
                        onChange={(e) => setShopSettings({ ...shopSettings, address: e.target.value })}
                        placeholder="e.g. Main Showroom, Hafizabad Road, Qila Didar Singh"
                        leftIcon={<MapPin size={15} color={theme.colors.onSurfaceVariant} />}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                        Contact Phone <span style={{ color: theme.colors.error }}>*</span>
                      </label>
                      <Input
                        value={shopSettings.phone}
                        onChange={(e) => setShopSettings({ ...shopSettings, phone: e.target.value })}
                        placeholder="e.g. 0304-8799010"
                        leftIcon={<Phone size={15} color={theme.colors.onSurfaceVariant} />}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                        Store Email
                      </label>
                      <Input
                        type="email"
                        value={shopSettings.email}
                        onChange={(e) => setShopSettings({ ...shopSettings, email: e.target.value })}
                        placeholder="e.g. info@bkmmotors.com"
                        leftIcon={<Mail size={15} color={theme.colors.onSurfaceVariant} />}
                      />
                    </div>

                    {/* Brand Name */}
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                        Brand Badge Title
                      </label>
                      <Input
                        value={shopSettings.brand_name}
                        onChange={(e) => setShopSettings({ ...shopSettings, brand_name: e.target.value })}
                        placeholder="e.g. REVOO"
                      />
                    </div>

                    {/* Brand Tagline */}
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                        Brand Subtitle
                      </label>
                      <Input
                        value={shopSettings.brand_tagline}
                        onChange={(e) => setShopSettings({ ...shopSettings, brand_tagline: e.target.value })}
                        placeholder="e.g. ELECTRIC MOTORCYCLE BRAND"
                      />
                    </div>

                    {/* Low Stock Warning Threshold */}
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                        Low Stock Alert Threshold (Units)
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={shopSettings.low_stock_threshold ?? 2}
                        onChange={(e) =>
                          setShopSettings({
                            ...shopSettings,
                            low_stock_threshold: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        placeholder="e.g. 2"
                        leftIcon={<AlertTriangle size={15} color="#d97706" />}
                      />
                      <p style={{ margin: "4px 0 0 0", fontSize: "11.5px", color: theme.colors.onSurfaceVariant }}>
                        Products with stock quantity less than or equal to this limit will trigger low-stock alerts on your dashboard.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={savingShop}
                      leftIcon={<Save size={15} />}
                    >
                      {savingShop ? "Saving..." : "Save Shop Details"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* CARD 2: Desktop Printer Configuration (Purple Scheme) */}
          <Card style={{ backgroundColor: theme.cardSchemes.purple.background, borderRadius: theme.rounded.xl, border: `1px solid ${theme.cardSchemes.purple.border}` }}>
            <CardHeader style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.cardSchemes.purple.headerBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                  <Printer size={22} color={theme.cardSchemes.purple.accent} style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <CardTitle style={{ fontSize: "16px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: theme.cardSchemes.purple.titleText }}>
                      Printer & Receipt Automation
                    </CardTitle>
                    <p style={{ fontSize: "12px", color: theme.cardSchemes.purple.text, margin: "2px 0 0 0" }}>
                      Configure default desktop printer, automatic receipt preview, and silent printing.
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDetectPrinters(false)}
                  disabled={detectingPrinters}
                  style={{ flexShrink: 0 }}
                  leftIcon={<RefreshCw size={14} className={detectingPrinters ? "animate-spin" : ""} />}
                >
                  {detectingPrinters ? "Detecting..." : "Detect Printers"}
                </Button>
              </div>
            </CardHeader>

            <CardContent style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Printer Selection Field */}
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: theme.cardSchemes.purple.titleText, marginBottom: "6px" }}>
                  Selected Windows Desktop Printer
                </label>
                {detectedPrinters.length > 0 ? (
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedPrinter}
                      onChange={(e) => setSelectedPrinter(e.target.value)}
                      style={{
                        width: "100%",
                        height: "42px",
                        padding: "0 14px",
                        borderRadius: theme.rounded.lg,
                        border: `1.5px solid ${theme.cardSchemes.purple.border}`,
                        fontSize: "13.5px",
                        backgroundColor: "#ffffff",
                        color: theme.colors.onSurface,
                        fontWeight: 600,
                        outline: "none",
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                      }}
                    >
                      <option value="">-- Use Default System Printer --</option>
                      {detectedPrinters.map((p) => (
                        <option key={p} value={p}>
                          🖨️ {p}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <Input
                    value={selectedPrinter}
                    onChange={(e) => setSelectedPrinter(e.target.value)}
                    placeholder="e.g. POS-80, Thermal Receipt Printer, FIT FP-1000"
                    leftIcon={<Printer size={15} color={theme.cardSchemes.purple.accent} />}
                  />
                )}
              </div>

              {/* Automation Switches Container */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: theme.cardSchemes.purple.titleText }}>
                  Automation & Print Behavior
                </span>

                {/* Auto Show Receipt Switch */}
                <Switch
                  variant="purple"
                  checked={autoShowReceipt}
                  onChange={(val) => setAutoShowReceipt(val)}
                  icon={<FileText size={18} />}
                  label="Auto Receipt Preview on Sale Completion"
                  badge={
                    <Badge variant={autoShowReceipt ? "violet" : "neutral"}>
                      {autoShowReceipt ? "Auto-Preview Enabled" : "Manual Preview Only"}
                    </Badge>
                  }
                  description="Automatically redirects to printable sale invoice."
                />

                {/* Silent Printing Switch */}
                <Switch
                  variant="purple"
                  checked={silentPrinting}
                  onChange={(val) => setSilentPrinting(val)}
                  icon={<Zap size={18} />}
                  label="Instant Silent Auto-Printing"
                  badge={
                    <Badge variant={silentPrinting ? "amber" : "neutral"}>
                      {silentPrinting ? "Silent Print Active" : "Print Dialog Prompt"}
                    </Badge>
                  }
                  description="Triggers print output when a checkout is recorded."
                />
              </div>

              {/* Action Button Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestPrint}
                  leftIcon={<Play size={13} />}
                >
                  Test Print
                </Button>
                <Button
                  variant="primary"
                  disabled={savingPrinter}
                  onClick={handleSavePrinterSettings}
                  leftIcon={<Save size={15} />}
                >
                  {savingPrinter ? "Saving..." : "Save Printer Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CARD 3: Database Auto-Backup & Restore (rose Scheme) */}
          <Card style={{ backgroundColor: theme.cardSchemes.rose.background, borderRadius: theme.rounded.xl, border: `1px solid ${theme.cardSchemes.rose.border}` }}>
            <CardHeader style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.cardSchemes.rose.headerBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                  <Database size={22} color={theme.cardSchemes.rose.accent} style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <CardTitle style={{ fontSize: "16px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: theme.cardSchemes.rose.titleText }}>
                      Database Backup & Restore
                    </CardTitle>
                    <p style={{ fontSize: "12px", color: theme.cardSchemes.rose.text, margin: "2px 0 0 0" }}>
                      Auto-backup on exit (%APPDATA%\\bike-pos\\backups).
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreDatabase()}
                    disabled={restoringDb}
                    leftIcon={<RotateCcw size={14} />}
                  >
                    Restore
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreateBackupNow}
                    disabled={creatingBackup}
                    leftIcon={<Save size={14} />}
                  >
                    Backup Now
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Backup Folder Path Box */}
              <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: theme.rounded.md, border: `1px solid ${theme.cardSchemes.rose.border}`, display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: theme.cardSchemes.rose.titleText }}>
                    <HardDrive size={16} color={theme.cardSchemes.rose.accent} />
                    <span>Backup Folder:</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectBackupFolder}
                    leftIcon={<FolderOpen size={13} />}
                  >
                    Change Folder
                  </Button>
                </div>

                <div style={{ fontFamily: "monospace", fontSize: "11.5px", backgroundColor: "#f8fafc", padding: "6px 10px", borderRadius: "4px", border: "1px solid #cbd5e1", color: "#0f172a", wordBreak: "break-all" }}>
                  {backupInfo?.backup_dir || "%APPDATA%\\bike-pos\\backups"}
                </div>
              </div>

              {/* Saved Backups List */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: theme.cardSchemes.rose.titleText }}>
                    Previous Backups ({backupInfo?.total_backups || 0})
                  </span>
                  <Button variant="outline" size="sm" onClick={fetchBackupInfo} leftIcon={<RefreshCw size={13} />}>
                    Refresh
                  </Button>
                </div>

                {loadingBackupInfo ? (
                  <div style={{ padding: "16px", textAlign: "center", color: theme.colors.onSurfaceVariant, fontSize: "12px" }}>
                    Loading backups list...
                  </div>
                ) : !backupInfo || backupInfo.backups.length === 0 ? (
                  <div style={{ padding: "16px", textAlign: "center", color: theme.colors.onSurfaceVariant, backgroundColor: "#ffffff", borderRadius: theme.rounded.md, fontSize: "12px" }}>
                    No backups created yet. Click <strong>"Backup Now"</strong> or close application to create an auto-backup.
                  </div>
                ) : (
                  <div style={{ border: `1px solid ${theme.cardSchemes.rose.border}`, borderRadius: theme.rounded.md, overflow: "hidden", maxHeight: "180px", overflowY: "auto", backgroundColor: "#ffffff" }}>
                    <Table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <TableHeader>
                        <TableRow style={{ backgroundColor: theme.cardSchemes.rose.badgeBg }}>
                          <TableHead style={{ padding: "6px 10px", color: theme.cardSchemes.rose.titleText }}>Filename</TableHead>
                          <TableHead style={{ padding: "6px 10px", color: theme.cardSchemes.rose.titleText }}>Date</TableHead>
                          <TableHead align="right" style={{ padding: "6px 10px", color: theme.cardSchemes.rose.titleText }}>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {backupInfo.backups.map((b) => (
                          <TableRow key={b.filename} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <TableCell style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 600, color: theme.colors.onSurface }}>
                              {b.filename}
                            </TableCell>
                            <TableCell style={{ color: theme.colors.onSurfaceVariant, fontSize: "11px" }}>
                              {b.created_at}
                            </TableCell>
                            <TableCell align="right" style={{ padding: "4px 8px" }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestoreDatabase(b.full_path)}
                                leftIcon={<RotateCcw size={12} />}
                              >
                                Restore
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CARD 4: Security & Password Settings (Amber Scheme) */}
          <Card style={{ backgroundColor: theme.cardSchemes.amber.background, borderRadius: theme.rounded.xl, border: `1px solid ${theme.cardSchemes.amber.border}` }}>
            <CardHeader style={{ padding: "18px 20px", borderBottom: `1px solid ${theme.cardSchemes.amber.headerBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                  <Lock size={22} color={theme.cardSchemes.amber.accent} style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <CardTitle style={{ fontSize: "16px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: theme.cardSchemes.amber.titleText }}>
                      Security & Password
                    </CardTitle>
                    <p style={{ fontSize: "12px", color: theme.cardSchemes.amber.text, margin: "2px 0 0 0" }}>
                      Update system login password.
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent style={{ padding: "20px" }}>
              <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Current Password */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                    Current Password <span style={{ color: theme.colors.error }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <Input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      leftIcon={<Lock size={15} color={theme.colors.onSurfaceVariant} />}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: theme.colors.onSurfaceVariant,
                      }}
                    >
                      {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                    New Password <span style={{ color: theme.colors.error }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <Input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 4 chars)"
                      leftIcon={<ShieldCheck size={15} color={theme.colors.onSurfaceVariant} />}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: theme.colors.onSurfaceVariant,
                      }}
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.colors.onSurface, marginBottom: "4px" }}>
                    Confirm New Password <span style={{ color: theme.colors.error }}>*</span>
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    leftIcon={<CheckCircle2 size={15} color={newPassword && confirmPassword === newPassword ? theme.colors.success : theme.colors.onSurfaceVariant} />}
                    required
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p style={{ margin: "3px 0 0 0", fontSize: "11.5px", color: theme.colors.error }}>
                      Passwords do not match.
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={updatingPass}
                    leftIcon={<ShieldCheck size={15} />}
                  >
                    {updatingPass ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
