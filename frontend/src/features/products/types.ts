import { z } from "zod";

import {
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_SORTABLE_COLUMNS,
} from "./constants";

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(PRODUCT_NAME_MAX_LENGTH),
  description: z.string().trim().max(PRODUCT_DESCRIPTION_MAX_LENGTH),
  price: z.number({ error: "Informe um preço válido" }).min(0, "Preço não pode ser negativo"),
  stock: z
    .number({ error: "Informe um estoque válido" })
    .int("Estoque deve ser inteiro")
    .min(0, "Estoque não pode ser negativo"),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
export type CreateProductInput = ProductFormInput;
export type UpdateProductInput = ProductFormInput;

export type ProductSortBy = (typeof PRODUCT_SORTABLE_COLUMNS)[number];
export type SortOrder = "asc" | "desc";

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  createdAt: string;
}

export interface ProductsListParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: ProductSortBy;
  sortOrder?: SortOrder;
}

export interface ProductsListResponse {
  data: Product[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface UseProductsFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: ProductSortBy;
  sortOrder?: SortOrder;
}

export interface ProductRow {
  id: number;
  name: string;
  description: string;
  priceLabel: string;
  stock: number;
  createdAtLabel: string;
}
