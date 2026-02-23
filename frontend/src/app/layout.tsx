import "./globals.css";
import { headers } from "next/headers";
import RootProviders from "./RootProviders";
import ClientLayout from "@/components/Layouts/ClientLayout";

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isAuthRoute = pathname.startsWith("/auth");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <RootProviders>
          {isAuthRoute ? children : <ClientLayout>{children}</ClientLayout>}
        </RootProviders>
      </body>
    </html>
  );
}