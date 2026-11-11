import { queryOptions } from "@tanstack/react-query";

import { getProductsList } from "../../services/products";
import type { ProductsListParams } from "../../types";

export const PRODUCTS_QUERY_KEY = ["products"] as const;
export const PRODUCTS_LIST_QUERY_PREFIX = [...PRODUCTS_QUERY_KEY, "list"] as const;

export function productsListQueryOptions(params: ProductsListParams) {
  return queryOptions({
    queryKey: [...PRODUCTS_LIST_QUERY_PREFIX, params] as const,
    queryFn: ({ signal }) => getProductsList(params, signal),
    staleTime: 30 * 1000,
  });
}
