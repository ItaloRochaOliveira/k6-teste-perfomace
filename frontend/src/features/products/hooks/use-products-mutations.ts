"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";

import { productErrorMessages } from "../errors";
import { createProduct, deleteProduct, updateProduct } from "../services/products";
import type { UpdateProductInput } from "../types";
import { PRODUCTS_LIST_QUERY_PREFIX } from "./queryOptions/products-query-options";

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return productErrorMessages[error.code] ?? error.message;
  return "Não foi possível concluir a operação.";
}

export function useProductsMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: PRODUCTS_LIST_QUERY_PREFIX });

  const create = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Produto criado.");
      return invalidate();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateProductInput }) =>
      updateProduct(id, body),
    onSuccess: () => {
      toast.success("Produto atualizado.");
      return invalidate();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Produto excluído.");
      return invalidate();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return { create, update, remove };
}
