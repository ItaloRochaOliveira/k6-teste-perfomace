import type { ReactNode } from "react";

import { LogoutButton } from "@/features/auth";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="font-semibold">K6 Teste Performance</span>
        <LogoutButton />
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
