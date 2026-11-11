import { Module } from '@nestjs/common';

import { AuthController } from './Controller/auth.controller';
import { AuthService } from './Service/auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
