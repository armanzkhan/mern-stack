"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { Toaster } from "sonner";
import RealtimeNotificationProvider from "@/components/RealtimeNotificationProvider";
import SimpleNotificationManager from "@/components/Notifications/SimpleNotificationManager";

/** App shell for non-auth routes; theme + user live in RootProviders. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeNotificationProvider>
      <SimpleNotificationManager>
        <SidebarProvider>{children}</SidebarProvider>
      </SimpleNotificationManager>
      <Toaster position="top-right" richColors />
    </RealtimeNotificationProvider>
  );
}