'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

// Use window.location.pathname instead of usePathname() to avoid "invariant expected layout router to be mounted"
// when this layout runs before the Next.js layout router is ready (e.g. on /auth/sign-in).
export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const [pathname, setPathname] = useState<string | null>(null);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  // Before we know the pathname, render children only (safe default)
  if (pathname === null) {
    return <>{children}</>;
  }

  // Check if this is a customer route (excluding customers management)
  const isCustomerRoute = (pathname.startsWith('/customer') && !pathname.startsWith('/customers')) ||
                         pathname === '/customer-login' ||
                         pathname === '/customer-login-success';

  if (isCustomerRoute) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
