import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { PrismaService } from '../../../database/prisma/prisma.service';
import { authErrorCode } from '../auth.errors';
import type { LoginBodyDto, SignupBodyDto } from '../schema/auth.schema';
import type { AuthUserRow, LoginResult } from '../types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(dto: SignupBodyDto): Promise<AuthUserRow> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existing) throw new ConflictException(authErrorCode.EMAIL_TAKEN);

    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    return this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash },
      select: { id: true, name: true, email: true },
    });
  }

  async login(dto: LoginBodyDto): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    const valid = user ? await bcrypt.compare(dto.password, user.passwordHash) : false;
    if (!user || !valid) throw new UnauthorizedException(authErrorCode.INVALID_CREDENTIALS);

    const accessToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET as string, {
      subject: String(user.id),
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as jwt.SignOptions['expiresIn'],
    });

    return { accessToken, user: { id: user.id, name: user.name, email: user.email } };
  }
}
