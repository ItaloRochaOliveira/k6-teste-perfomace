"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { mapAuthError } from "../mappers/auth";
import { signup } from "../services/auth";

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success("Cadastro realizado! Faça login.");
      router.push("/login");
    },
    onError: (error) => toast.error(mapAuthError(error)),
  });
}
