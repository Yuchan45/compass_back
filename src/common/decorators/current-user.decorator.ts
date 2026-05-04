import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../../modules/auth/types/authenticated-user.type';

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user) {
      throw new Error('Authenticated user is missing from request context.');
    }

    return request.user;
  },
);
