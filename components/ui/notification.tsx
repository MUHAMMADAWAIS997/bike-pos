"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { theme } from "@/lib/theme";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  title?: string;
  duration?: number;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, type: NotificationType = "info", title?: string, duration: number = 4000) => {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newItem: NotificationItem = { id, message, type, title, duration };

      setNotifications((prev) => [newItem, ...prev]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    [removeNotification]
  );

  const success = useCallback((message: string, title?: string) => notify(message, "success", title), [notify]);
  const error = useCallback((message: string, title?: string) => notify(message, "error", title), [notify]);
  const info = useCallback((message: string, title?: string) => notify(message, "info", title), [notify]);
  const warning = useCallback((message: string, title?: string) => notify(message, "warning", title), [notify]);

  return (
    <NotificationContext.Provider value={{ notify, success, error, info, warning, removeNotification }}>
      {children}

      {/* Top Center Notification Container (Absolute/Fixed Overlay) */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          pointerEvents: "none",
          width: "100%",
          maxWidth: "460px",
          padding: "0 16px",
          boxSizing: "border-box",
        }}
      >
        {notifications.map((item) => (
          <NotificationToast
            key={item.id}
            item={item}
            onClose={() => removeNotification(item.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

interface NotificationToastProps {
  item: NotificationItem;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ item, onClose }) => {
  let bg: string = theme.colors.surfaceContainerLowest;
  let color: string = theme.colors.onSurface;
  let border: string = `1px solid ${theme.colors.outlineVariant}`;
  let icon = <Info size={18} color={theme.colors.primary} />;

  if (item.type === "success") {
    bg = "#f0fdf4";
    color = "#166534";
    border = "1px solid #bbf7d0";
    icon = <CheckCircle2 size={18} color="#15803d" />;
  } else if (item.type === "error") {
    bg = "#fef2f2";
    color = "#991b1b";
    border = "1px solid #fecaca";
    icon = <XCircle size={18} color="#b91c1c" />;
  } else if (item.type === "warning") {
    bg = "#fffbeb";
    color = "#92400e";
    border = "1px solid #fde68a";
    icon = <AlertTriangle size={18} color="#b45309" />;
  } else if (item.type === "info") {
    bg = "#f0f9ff";
    color = "#075985";
    border = "1px solid #bae6fd";
    icon = <Info size={18} color="#0369a1" />;
  }

  return (
    <div
      style={{
        pointerEvents: "auto",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        width: "100%",
        backgroundColor: bg,
        color: color,
        border: border,
        borderRadius: theme.rounded.md,
        padding: "12px 16px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        fontFamily: theme.typography.bodyMd.fontFamily,
        fontSize: "14px",
        lineHeight: "1.4",
        transition: "all 0.2s ease-in-out",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginTop: "1px", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        {item.title && (
          <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>
            {item.title}
          </div>
        )}
        <div>{item.message}</div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: color,
          opacity: 0.7,
          padding: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "1px",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
