import { FastifyRequest } from 'fastify';

import { UserPayload } from './tokens.types';

export interface RequestWithUser extends FastifyRequest {
  user: UserPayload;
}
