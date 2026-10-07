"use client";

// Hardcoded trial start date (Fixed build release date: September 12, 2026)
// This prevents trial resets if the user reinstalls the application or clears local storage.
const HARDCODED_TRIAL_START_DATE_STR = "2026-09-12T00:00:00";
const TRIAL_START_TIMESTAMP = new Date(HARDCODED_TRIAL_START_DATE_STR).getTime();
const TRIAL_DURATION_DAYS = 30;

export interface TrialInfo {
  daysRemaining: number;
  isExpired: boolean;
  totalDays: number;
  startDateStr: string;
}

export function getTrialInfo(): TrialInfo {
  const now = Date.now();
  const elapsedMs = now - TRIAL_START_TIMESTAMP;
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

  // Calculate days remaining from hardcoded start date
  const daysRemaining = Math.max(0, Math.ceil(TRIAL_DURATION_DAYS - elapsedDays));
  const isExpired = elapsedMs >= TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000 || daysRemaining <= 0;

  const startDate = new Date(TRIAL_START_TIMESTAMP);
  const startDateStr = startDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return {
    daysRemaining: isExpired ? 0 : daysRemaining,
    isExpired,
    totalDays: TRIAL_DURATION_DAYS,
    startDateStr,
  };
}
