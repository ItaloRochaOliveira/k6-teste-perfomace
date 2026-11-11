"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { useEffect, useMemo, useState } from "react";

import { DEBOUNCE_MS, PRODUCTS_DEFAULT_PAGE_SIZE } from "../constants";
import { mapProductToRow } from "../mappers/product";
import type { Product, ProductsListParams, UseProductsFilters } from "../types";
import { productsListQueryOptions } from "./queryOptions/products-query-options";

export function useProducts(filters: UseProductsFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? PRODUCTS_DEFAULT_PAGE_SIZE;

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search ?? "");
  const debouncedSetSearch = useMemo(() => debounce(setDebouncedSearch, DEBOUNCE_MS), []);

  useEffect(() => {
    debouncedSetSearch(filters.search ?? "");
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch, filters.search]);

  const queryParams: ProductsListParams = {
    page,
    pageSize,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(filters.sortBy ? { sortBy: filters.sortBy } : {}),
    ...(filters.sortOrder ? { sortOrder: filters.sortOrder } : {}),
  };

  const { data, isLoading, error, refetch } = useQuery({
    ...productsListQueryOptions(queryParams),
    placeholderData: keepPreviousData,
  });

  const products: Product[] = data?.data ?? [];

  return {
    products,
    rows: products.map(mapProductToRow),
    total: data?.pagination.total ?? 0,
    totalPages: data?.pagination.totalPages ?? 1,
    isLoading,
    error,
    refetch,
  };
}
