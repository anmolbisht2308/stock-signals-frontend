import { AuthGate } from "@/components/auth-gate";
import { Sidebar } from "@/components/sidebar";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 pb-24 md:p-8">
        <div className="mx-auto max-w-6xl">
          <AuthGate>{children}</AuthGate>
        </div>
      </main>
    </div>
  );
}
