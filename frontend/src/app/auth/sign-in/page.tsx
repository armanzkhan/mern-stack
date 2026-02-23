"use client";

import SignInPageContent from "@/components/Auth/SignInPageContent";

/**
 * App Router sign-in page. Uses same React tree as rest of app (no Pages Router) to avoid "useContext" null error.
 * Root layout already provides ThemeProvider + UserProvider for /auth routes.
 */
export default function SignInPage() {
  return <SignInPageContent />;
}
