"use client";

import { useEffect, useState } from "react";
import ClientLayout from "./ClientLayout";

interface RootLayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * For /auth/* routes we render only {children} so the segment is not wrapped
 * in ClientLayout. This avoids "invariant expected layout router to be mounted"
 * because we never run our client layout tree (Providers, ConditionalLayout, etc.)
 * before the Next.js layout router is ready on auth pages.
 * Uses window.location.pathname (set in useEffect) so we never call usePathname().
 */
export default function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
  const [pathname, setPathname] = useState<string | null>(null);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  // Wait for client to know pathname
  if (pathname === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // Auth routes: render segment only (no ClientLayout). Auth layout provides AuthProviders.
  if (pathname.startsWith("/auth")) {
    return <>{children}</>;
  }

  return <ClientLayout>{children}</ClientLayout>;
}
