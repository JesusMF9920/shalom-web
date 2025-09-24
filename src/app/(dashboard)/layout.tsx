import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { ProtectedRoute } from "@/components/shared/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
