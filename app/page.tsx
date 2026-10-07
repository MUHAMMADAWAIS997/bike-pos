"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginCard } from "@/components/auth/login-card";
import { ResetPasswordCard } from "@/components/auth/reset-password-card";
import { TrialExpiredCard } from "@/components/auth/trial-expired-card";
import { getTrialInfo, TrialInfo } from "@/lib/trial";
import { Clock } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"login" | "reset">("login");
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({
    daysRemaining: 30,
    isExpired: false,
    totalDays: 30,
    startDateStr: "",
  });

  useEffect(() => {
    setTrialInfo(getTrialInfo());
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9ff",
        backgroundImage: "radial-gradient(#d3e4fe 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Top Right Trial Remaining Badge */}
      {!trialInfo.isExpired && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "24px",
            zIndex: 999,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "24px",
              backgroundColor: "#f0f9ff",
              border: "1.5px solid #0284c7",
              color: "#0369a1",
              fontSize: "13px",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.15)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Clock size={16} color="#0284c7" />
            <span>
              {trialInfo.daysRemaining} {trialInfo.daysRemaining === 1 ? "Day" : "Days"} Trial Left
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area: Show Lock Dialog when trial complete, else Login/Reset */}
      {trialInfo.isExpired ? (
        <TrialExpiredCard />
      ) : viewMode === "login" ? (
        <LoginCard
          onSuccess={() => router.push("/dashboard")}
          onForgotClick={() => setViewMode("reset")}
        />
      ) : (
        <ResetPasswordCard
          onBackToLogin={() => setViewMode("login")}
          onResetSuccess={() => setViewMode("login")}
        />
      )}
    </div>
  );
}
