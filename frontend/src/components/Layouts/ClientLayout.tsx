'use client';

import { Providers } from "@/app/providers";
import ConditionalLayout from "./ConditionalLayout";
import PWAProvider from "@/components/PWAProvider";

interface ClientLayoutProps {
  children: React.ReactNode;
}

// Used only for non-auth routes (auth uses RootLayoutWrapper → children only).
export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <PWAProvider>
      <Providers>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </Providers>
    </PWAProvider>
  );
}
