import type { Prisma } from '@prisma/client';

export const PRODUCT_SELECT_FIELDS = {
  id: true,
  name: true,
  description: true,
  price: true,
  stock: true,
  createdAt: true,
} satisfies Prisma.ProductSelect;

type ProductDbRow = Prisma.ProductGetPayload<{ select: typeof PRODUCT_SELECT_FIELDS }>;

export interface ProductRow extends Omit<ProductDbRow, 'price'> {
  price: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export function toProductRow(row: ProductDbRow): ProductRow {
  return { ...row, price: Number(row.price) };
}
