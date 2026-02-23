"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";
import RealtimeNotificationProvider from "@/components/RealtimeNotificationProvider";
import SimpleNotificationManager from "@/components/Notifications/SimpleNotificationManager";

/**
 * App shell providers for (main) routes only. Theme + User come from RootProviders in root layout.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <RealtimeNotificationProvider>
      {mounted ? (
        <SimpleNotificationManager>
          <SidebarProvider>{children}</SidebarProvider>
        </SimpleNotificationManager>
      ) : (
        <SidebarProvider>{children}</SidebarProvider>
      )}
      <Toaster position="top-right" richColors />
    </RealtimeNotificationProvider>
  );
}