"use client";

import dynamic from "next/dynamic";

// dynamic(..., { ssr: false }) must run in a Client Component (not in app/layout.tsx).
const RootLayoutWrapper = dynamic(
  () => import("@/components/Layouts/RootLayoutWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    ),
  }
);

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayoutWrapper>{children}</RootLayoutWrapper>;
}
