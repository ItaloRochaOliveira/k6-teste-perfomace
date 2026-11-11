"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setToken } from "@/lib/auth-token";

import { mapAuthError } from "../mappers/auth";
import { login } from "../services/auth";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setToken(data.accessToken);
      router.push("/products");
      router.refresh();
    },
    onError: (error) => toast.error(mapAuthError(error)),
  });
}
