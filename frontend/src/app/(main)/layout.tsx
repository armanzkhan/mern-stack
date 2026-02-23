/**
 * (main) route group — passthrough only. Sidebar/ClientLayout is applied in root layout for all non-auth routes.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
