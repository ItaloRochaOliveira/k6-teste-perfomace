import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

import type { AuthenticatedRequest } from './auth-context.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    const value = Array.isArray(header) ? header[0] : header;

    if (!value || !value.startsWith('Bearer ')) {
      throw new UnauthorizedException('AUTH_TOKEN_MISSING');
    }

    try {
      const payload = jwt.verify(value.slice(7), process.env.JWT_SECRET as string) as unknown as {
        sub: string;
        email: string;
      };
      request.auth = { userId: Number(payload.sub), email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('AUTH_TOKEN_INVALID');
    }
  }
}
