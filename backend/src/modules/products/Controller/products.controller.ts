import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthCtx } from '../../../common/auth/auth-context.decorator';
import type { AuthContext } from '../../../common/auth/auth-context.interface';
import { JwtAuthGuard } from '../../../common/auth/jwt-auth.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  type CreateProductBodyDto,
  createProductBodySchema,
  type ListProductsQueryDto,
  listProductsQuerySchema,
  type UpdateProductBodyDto,
  updateProductBodySchema,
} from '../schema/products.schema';
import { ProductsService } from '../Service/products.service';
import type { PaginatedResult, ProductRow } from '../types';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  findAll(
    @AuthCtx() auth: AuthContext,
    @Query(new ZodValidationPipe(listProductsQuerySchema)) query: ListProductsQueryDto,
  ): Promise<PaginatedResult<ProductRow>> {
    return this.service.findAll(auth, query);
  }

  @Get(':id')
  findOne(
    @AuthCtx() auth: AuthContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductRow> {
    return this.service.findOne(auth, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @AuthCtx() auth: AuthContext,
    @Body(new ZodValidationPipe(createProductBodySchema)) dto: CreateProductBodyDto,
  ): Promise<ProductRow> {
    return this.service.create(auth, dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @AuthCtx() auth: AuthContext,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateProductBodySchema)) dto: UpdateProductBodyDto,
  ): Promise<void> {
    await this.service.update(auth, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@AuthCtx() auth: AuthContext, @Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.remove(auth, id);
  }
}
