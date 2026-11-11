import { Module } from '@nestjs/common';

import { ProductsController } from './Controller/products.controller';
import { ProductsService } from './Service/products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
