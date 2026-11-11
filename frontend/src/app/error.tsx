"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-lg font-medium">Algo deu errado.</p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
