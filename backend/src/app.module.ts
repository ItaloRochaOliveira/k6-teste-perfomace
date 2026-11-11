import { Module } from '@nestjs/common';

import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [PrismaModule, AuthModule, ProductsModule],
})
export class AppModule {}
