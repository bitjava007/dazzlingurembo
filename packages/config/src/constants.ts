export const APP_NAME = 'Dazzling UM';
export const APP_DESCRIPTION = 'Enterprise-grade management platform';
export const APP_VERSION = '0.1.0';

export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const JWT_COOKIE_NAME = 'access_token';

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const CORS_ORIGINS = {
  development: ['http://localhost:3000', 'http://localhost:3001'],
  production: [] as string[],
  test: ['http://localhost:3000'],
} as const;
