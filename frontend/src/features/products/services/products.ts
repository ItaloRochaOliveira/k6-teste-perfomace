import { api } from "@/lib/api";

import type {
  CreateProductInput,
  Product,
  ProductsListParams,
  ProductsListResponse,
  UpdateProductInput,
} from "../types";

const PATH = "/products";

export function getProductsList(params: ProductsListParams, signal?: AbortSignal) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  return api.get<ProductsListResponse>(`${PATH}?${query.toString()}`, signal);
}

export function createProduct(body: CreateProductInput) {
  return api.post<Product>(PATH, body);
}

export function updateProduct(id: number, body: UpdateProductInput) {
  return api.put<void>(`${PATH}/${id}`, body);
}

export function deleteProduct(id: number) {
  return api.delete<void>(`${PATH}/${id}`);
}
