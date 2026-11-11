import { z } from 'zod';

export const createProductBodySchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).nullish(),
  price: z.number().min(0).max(99999999.99),
  stock: z.number().int().min(0).default(0),
});

export const updateProductBodySchema = createProductBodySchema;

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.enum(['id', 'name', 'price', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateProductBodyDto = z.infer<typeof createProductBodySchema>;
export type UpdateProductBodyDto = z.infer<typeof updateProductBodySchema>;
export type ListProductsQueryDto = z.infer<typeof listProductsQuerySchema>;
