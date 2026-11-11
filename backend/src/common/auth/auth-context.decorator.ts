import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthContext, AuthenticatedRequest } from './auth-context.interface';

export const AuthCtx = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthContext => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.auth as AuthContext;
  },
);
