"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import SimpleNotificationManager from "@/components/Notifications/SimpleNotificationManager";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Use window.location.pathname instead of usePathname() to avoid "invariant expected layout router to be mounted"
// when this layout runs before the Next.js layout router is ready (e.g. on /auth/sign-in).
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [pathname, setPathname] = useState<string | null>(null);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  // Before we know the pathname, render children only (safe default for auth routes)
  if (pathname === null) {
    return <>{children}</>;
  }

  const isAuthRoute = pathname.startsWith("/auth/");

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <SimpleNotificationManager>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 w-full min-w-0 overflow-x-hidden">
            <div className="w-full min-w-0 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2 sm:py-4 md:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SimpleNotificationManager>
  );
}
