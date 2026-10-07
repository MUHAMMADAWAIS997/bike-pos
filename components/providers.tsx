"use client";

import React, { ReactNode } from "react";
import { NotificationProvider } from "@/components/ui/notification";

export function Providers({ children }: { children: ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}
