"use client";

import { ThemeProvider } from "next-themes";
import { UserProvider } from "@/components/Auth/user-context";

/**
 * Wraps all App Router routes so useUser() and theme work everywhere
 * (orders, invoices, dashboard, etc.), not only under (main).
 */
export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      defaultTheme="light"
      attribute="class"
      enableSystem={false}
      disableTransitionOnChange
    >
      <UserProvider>{children}</UserProvider>
    </ThemeProvider>
  );
}
