import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  type LoginBodyDto,
  loginBodySchema,
  type SignupBodyDto,
  signupBodySchema,
} from '../schema/auth.schema';
import { AuthService } from '../Service/auth.service';
import type { AuthUserRow, LoginResult } from '../types';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body(new ZodValidationPipe(signupBodySchema)) dto: SignupBodyDto): Promise<AuthUserRow> {
    return this.service.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body(new ZodValidationPipe(loginBodySchema)) dto: LoginBodyDto): Promise<LoginResult> {
    return this.service.login(dto);
  }
}
