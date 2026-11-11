"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/auth-token";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        clearToken();
        queryClient.clear();
        router.push("/login");
        router.refresh();
      }}
    >
      Sair
    </Button>
  );
}
