"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useNotification } from "@/components/ui/notification";
import { Watermark } from "@/components/common/watermark";
import { getTrialInfo } from "@/lib/trial";
import {
  LayoutDashboard,
  Motorbike,
  Boxes,
  CreditCard,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  FolderCog,
  User,
  Truck,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Menu,
  X,
} from "lucide-react";

export interface SidebarProps {
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { notify } = useNotification();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const trial = getTrialInfo();
    if (trial.isExpired) {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isManageActive =
    pathname === "/customer" ||
    pathname === "/supplier" ||
    pathname === "/partners" ||
    pathname === "/finance" ||
    pathname.startsWith("/manage");

  const [isManageOpen, setIsManageOpen] = useState(isManageActive);
  const scheme = theme.sidebarSchemes.midnightTeal;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      notify("Logged out successfully.", "info");
      router.push("/");
    }
  };

  const navItem = (name: string, href: string, Icon: React.ElementType) => {
    const isActive =
      pathname === href ||
      (href === "/inventory" && pathname.startsWith("/inventory")) ||
      (href === "/stock-control/add" && pathname.startsWith("/stock-control"));
    return (
      <Link key={name} href={href} style={{ textDecoration: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 12px",
            borderRadius: theme.rounded.md,
            background: isActive ? scheme.activeBg : "transparent",
            boxShadow: isActive ? "0 4px 12px rgba(0, 131, 120, 0.35)" : "none",
            color: isActive ? scheme.activeText : scheme.navText,
            fontWeight: isActive ? 600 : 500,
            fontSize: "13.5px",
            fontFamily: theme.typography.labelMd.fontFamily,
            transition: "all 0.2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = scheme.navHoverBg;
              e.currentTarget.style.color = scheme.navHoverText;
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = scheme.navText;
            }
          }}
        >
          <Icon size={17} color={isActive ? scheme.activeIcon : scheme.inactiveIcon} />
          <span>{name}</span>
        </div>
      </Link>
    );
  };

  const sidebarContent = (
    <aside
      style={{
        width: theme.spacing.sidebarWidth,
        minWidth: theme.spacing.sidebarWidth,
        maxWidth: theme.spacing.sidebarWidth,
        flexShrink: 0,
        height: isMobileScreen ? "100%" : "100vh",
        position: isMobileScreen ? "relative" : "sticky",
        top: 0,
        background: scheme.background,
        borderRight: scheme.borderRight,
        padding: "18px 14px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        userSelect: "none",
        overflowY: "auto",
        zIndex: 50,
      }}
    >
      {/* Top Header & Navigation Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Brand Logo & Title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/logo.png"
              alt="BKM Motors Logo"
              style={{
                width: "36px",
                height: "36px",
                objectFit: "contain",
                borderRadius: theme.rounded.md,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: theme.typography.headlineLg.fontFamily,
                  fontWeight: 700,
                  fontSize: "16.5px",
                  color: scheme.brandTitle,
                  letterSpacing: "-0.01em",
                  lineHeight: "1.2",
                }}
              >
                BKM Motors
              </div>
              <div
                style={{
                  fontFamily: theme.typography.labelMd.fontFamily,
                  fontSize: "10.5px",
                  color: scheme.brandSubtitle,
                  marginTop: "1px",
                }}
              >
                Admin Portal
              </div>
            </div>
          </div>

          {isMobileScreen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Primary Action Button: + New Sale */}
        <Link href="/pos" style={{ textDecoration: "none" }}>
          <button
            style={{
              width: "100%",
              height: "40px",
              background: "linear-gradient(135deg, #008378 0%, #00685f 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: theme.rounded.md,
              boxShadow: "0 4px 12px rgba(0, 131, 120, 0.4)",
              fontFamily: theme.typography.bodyMd.fontFamily,
              fontWeight: 600,
              fontSize: "13.5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 131, 120, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 131, 120, 0.4)";
            }}
          >
            <Plus size={18} />
            <span>New Sale</span>
          </button>
        </Link>

        {/* Main Navigation Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {navItem("Dashboard", "/dashboard", LayoutDashboard)}

          {/* Manage Dropdown Menu */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              onClick={() => setIsManageOpen(!isManageOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                borderRadius: theme.rounded.md,
                backgroundColor: isManageActive ? scheme.navHoverBg : "transparent",
                color: isManageActive ? scheme.activeText : scheme.navText,
                fontWeight: isManageActive ? 600 : 500,
                fontSize: "13.5px",
                fontFamily: theme.typography.labelMd.fontFamily,
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isManageActive) {
                  e.currentTarget.style.backgroundColor = scheme.navHoverBg;
                  e.currentTarget.style.color = scheme.navHoverText;
                }
              }}
              onMouseLeave={(e) => {
                if (!isManageActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = scheme.navText;
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FolderCog size={17} color={isManageActive ? scheme.activeIcon : scheme.inactiveIcon} />
                <span>Manage</span>
              </div>
              {isManageOpen ? (
                <ChevronDown size={15} color={scheme.inactiveIcon} />
              ) : (
                <ChevronRight size={15} color={scheme.inactiveIcon} />
              )}
            </div>

            {/* Manage Sub-items Dropdown List */}
            {isManageOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "2px", paddingLeft: "14px" }}>
                {navItem("Customer", "/customer", User)}
                {navItem("Supplier", "/supplier", Truck)}
                {navItem("Partners", "/partners", Users)}
                {navItem("Finance", "/finance", DollarSign)}
              </div>
            )}
          </div>

          {navItem("Inventory", "/inventory", Motorbike)}
          {navItem("Stock Control", "/stock-control/add", Boxes)}
          {navItem("Expenses", "/expenses", CreditCard)}
          {navItem("Revenue Summary", "/revenue-summary", TrendingUp)}
          {navItem("Settings", "/settings", Settings)}
        </nav>
      </div>

      {/* Bottom Navigation Section (Logout) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "12px" }}>
        <div
          style={{
            height: "1px",
            backgroundColor: scheme.divider,
            margin: "6px 0",
          }}
        />

        {/* Logout Item */}
        <div
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 12px",
            borderRadius: theme.rounded.md,
            color: "white",
            fontWeight: 600,
            fontSize: "13.5px",
            fontFamily: theme.typography.labelMd.fontFamily,
            cursor: "pointer",
            transition: "all 0.15s ease",
            background: "#FF3232",
            textAlign: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
            e.currentTarget.style.color = "#fca5a5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FF3232";
            e.currentTarget.style.color = "white";
          }}
        >
          <LogOut size={17} color="white" />
          <span>Logout</span>
        </div>

        {/* Sidebar Bottom Watermark */}
        <Watermark style={{ marginTop: "14px", color: scheme.brandSubtitle, fontSize: "10.5px" }} />
      </div>
    </aside>
  );

  if (isMobileScreen) {
    return (
      <>
        {/* Mobile Header Bar */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "50px",
            backgroundColor: scheme.background,
            borderBottom: scheme.borderRight,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            zIndex: 1000,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.png" alt="Logo" style={{ width: "28px", height: "28px", objectFit: "contain" }} />
            <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "15px" }}>BKM Motors</span>
          </div>
          <button
            onClick={() => setIsMobileOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
            }}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Mobile Drawer Backdrop & Container */}
        {isMobileOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(3px)",
              zIndex: 2000,
              display: "flex",
            }}
            onClick={() => setIsMobileOpen(false)}
          >
            <div
              style={{
                width: theme.spacing.sidebarWidth,
                height: "100%",
                backgroundColor: scheme.background,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return sidebarContent;
};

