import { FastifyRequest } from 'fastify';
import { HookHandlerDoneFunction } from 'fastify/types/hooks';

export interface App {
  id: string;
  name: string;
  url: string;
}

const APP_CONFIGS: Record<string, App> = {
  'api.intellicharts.com': {
    id: 'intellicharts',
    name: 'Intellicharts',
    url: 'https://intellicharts.com',
  },
  'staging.api.intellicharts.com': {
    id: 'intellicharts',
    name: 'Intellicharts',
    url: 'https://staging.intellicharts.com',
  },
};

const DEFAULT_APP: App = {
  id: 'intellicharts',
  name: 'Intellicharts',
  url: 'https://intellicharts.com',
};

declare module 'fastify' {
  interface FastifyRequest {
    app: App;
  }
}

export function appIdentifierMiddleware(
  request: FastifyRequest,
  _: any,
  done: HookHandlerDoneFunction,
): void {
  const host = request.hostname;

  // Handle localhost
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    request.app = {
      id: 'intellicharts',
      name: 'Intellicharts',
      url: `${request.protocol}://${host}:3000`,
    };
    done();
    return;
  }

  // Exact host matching using object lookup
  request.app = APP_CONFIGS[host] || DEFAULT_APP;
  done();
}
