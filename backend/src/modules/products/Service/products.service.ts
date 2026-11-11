import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import type { AuthContext } from '../../../common/auth/auth-context.interface';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { productErrorCode } from '../products.errors';
import type {
  CreateProductBodyDto,
  ListProductsQueryDto,
  UpdateProductBodyDto,
} from '../schema/products.schema';
import {
  PRODUCT_SELECT_FIELDS,
  type PaginatedResult,
  type ProductRow,
  toProductRow,
} from '../types';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // Sem multi-tenant neste projeto: apenas soft delete.
  private readScope(): Prisma.ProductWhereInput {
    return { deletedAt: null };
  }

  async findAll(
    _auth: AuthContext,
    query: ListProductsQueryDto,
  ): Promise<PaginatedResult<ProductRow>> {
    const search = query.search?.trim();
    const where: Prisma.ProductWhereInput = {
      ...this.readScope(),
      ...(search
        ? { OR: [{ name: { contains: search } }, { description: { contains: search } }] }
        : {}),
    };

    const { page, pageSize, sortBy, sortOrder } = query;
    const direction: Prisma.SortOrder = sortOrder ?? 'desc';
    const orderByByField: Record<
      NonNullable<typeof sortBy>,
      Prisma.ProductOrderByWithRelationInput
    > = {
      id: { id: direction },
      name: { name: direction },
      price: { price: direction },
      createdAt: { createdAt: direction },
    };
    const orderBy: Prisma.ProductOrderByWithRelationInput = sortBy
      ? orderByByField[sortBy]
      : { createdAt: 'desc' };

    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        select: PRODUCT_SELECT_FIELDS,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: rows.map(toProductRow),
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    };
  }

  async findOne(_auth: AuthContext, id: number): Promise<ProductRow> {
    const row = await this.prisma.product.findFirst({
      where: { id, ...this.readScope() },
      select: PRODUCT_SELECT_FIELDS,
    });
    if (!row) throw new NotFoundException(productErrorCode.NOT_FOUND);
    return toProductRow(row);
  }

  async create(auth: AuthContext, dto: CreateProductBodyDto): Promise<ProductRow> {
    const row = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        price: dto.price,
        stock: dto.stock,
        createdByUserId: auth.userId,
      },
      select: PRODUCT_SELECT_FIELDS,
    });
    return toProductRow(row);
  }

  async update(_auth: AuthContext, id: number, dto: UpdateProductBodyDto): Promise<void> {
    await this.assertExists(id);
    await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description ?? null,
        price: dto.price,
        stock: dto.stock,
      },
    });
  }

  async remove(_auth: AuthContext, id: number): Promise<void> {
    await this.assertExists(id);
    await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async assertExists(id: number): Promise<void> {
    const existing = await this.prisma.product.findFirst({
      where: { id, ...this.readScope() },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException(productErrorCode.NOT_FOUND);
  }
}
