"use client";

import React from "react";
import { theme } from "@/lib/theme";
import { Lock, ShieldAlert, Phone, Mail, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTrialInfo } from "@/lib/trial";

export const TrialExpiredCard: React.FC = () => {
  const trial = getTrialInfo();

  const handleContactClick = () => {
    if (typeof window !== "undefined") {
      window.open("https://intefig.com/", "_blank");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "480px",
        maxHeight: "90vh",
        overflowY: "auto",
        backgroundColor: theme.colors.surfaceContainerLowest,
        border: `2px solid #ef4444`,
        borderRadius: theme.rounded.lg,
        boxShadow: "0 20px 35px -10px rgba(239, 68, 68, 0.15), 0 10px 15px -5px rgba(0, 0, 0, 0.05)",
        padding: "36px 20px 24px 20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
      }}
    >
      {/* Top Warning Strip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "#ef4444",
          color: "#ffffff",
          padding: "6px 0",
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        <ShieldAlert size={14} />
        System Access Locked &bull; {trial.totalDays} Days Trial Expired
      </div>

      {/* Brand Logo Header Image */}
      <div style={{ marginTop: "16px", marginBottom: "16px", display: "flex", justifyContent: "center" }}>
        <img
          src="/logo.png"
          alt="BKM Motors Logo"
          style={{
            height: "52px",
            width: "auto",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Lock Icon */}
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#fee2e2",
          border: "2px solid #fca5a5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          color: "#dc2626",
        }}
      >
        <Lock size={30} />
      </div>

      {/* Title */}
      <h2
        style={{
          fontFamily: theme.typography.display.fontFamily,
          fontSize: "24px",
          fontWeight: 800,
          color: "#991b1b",
          margin: "0 0 8px 0",
          letterSpacing: "-0.01em",
        }}
      >
        {trial.totalDays}-Days Trial Completed
      </h2>

      <p
        style={{
          fontFamily: theme.typography.bodyMd.fontFamily,
          fontSize: "13.5px",
          color: theme.colors.onSurfaceVariant,
          margin: "0 0 24px 0",
          lineHeight: "1.5",
        }}
      >
        Your {trial.totalDays}-day evaluation period for BKM Motors POS has expired. Login and internal routes are disabled.
      </p>

      {/* INTEFIG WATERMARK CONTACT DIALOG BOX */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#f8fafc",
          border: "1.5px solid #cbd5e1",
          borderRadius: theme.rounded.md,
          padding: "20px 18px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: "20px",
          position: "relative",
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#0c4a6e", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          CONTACT INTEFIG TO ACCESS SYSTEM
        </div>

        {/* Intefig Watermark Logo / Title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px", fontWeight: 900, color: "#0284c7", letterSpacing: "0.05em" }}>
            INTEFIG
          </span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>
            Software & Automation Systems
          </span>
        </div>

        <p style={{ margin: 0, fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
          Please contact <strong>INTEFIG</strong> to get your official full software license key and restore system access.
        </p>

        {/* Contact Links & Numbers */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#0f172a", marginTop: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Phone size={14} color="#0284c7" />
            <span><strong>Helpline:</strong> 0335-9940100 / 0304-8799010</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Mail size={14} color="#0284c7" />
            <span><strong>Email:</strong> info@intefig.com</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Globe size={14} color="#0284c7" />
            <span><strong>Website:</strong> www.intefig.com</span>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        onClick={handleContactClick}
        rightIcon={<ExternalLink size={16} />}
        style={{ width: "100%", justifyContent: "center", height: "42px", fontSize: "14px", fontWeight: 700 }}
      >
        Visit Intefig Website
      </Button>
    </div>
  );
};

export default TrialExpiredCard;
