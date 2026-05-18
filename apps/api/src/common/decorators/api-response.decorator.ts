import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';

interface ApiResponseDecoratorOptions {
  summary?: string;
  description?: string;
  status?: number;
}

/**
 * Convenience decorator that wraps @ApiOperation + @ApiResponse for standard success responses.
 */
export function ApiStandardResponse(options: ApiResponseDecoratorOptions = {}) {
  const { summary = '', description = '', status = HttpStatus.OK } = options;

  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({
      status,
      description: description || 'Success',
      schema: {
        properties: {
          data: { type: 'object' },
          message: { type: 'string', example: 'Success' },
          success: { type: 'boolean', example: true },
          statusCode: { type: 'number', example: status },
          timestamp: { type: 'string', example: new Date().toISOString() },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' }),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' }),
  );
}

/**
 * Convenience decorator for 201 Created responses.
 */
export function ApiCreatedResponse(options: Omit<ApiResponseDecoratorOptions, 'status'> = {}) {
  return applyDecorators(
    HttpCode(HttpStatus.CREATED),
    ApiStandardResponse({ ...options, status: HttpStatus.CREATED }),
  );
}

/**
 * Convenience decorator for paginated responses.
 */
export function ApiPaginatedResponse(options: ApiResponseDecoratorOptions = {}) {
  const { summary = '', description = '', status = HttpStatus.OK } = options;

  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({
      status,
      description: description || 'Paginated success',
      schema: {
        properties: {
          data: { type: 'array', items: { type: 'object' } },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
              hasNextPage: { type: 'boolean' },
              hasPreviousPage: { type: 'boolean' },
            },
          },
          message: { type: 'string' },
          success: { type: 'boolean' },
          statusCode: { type: 'number' },
          timestamp: { type: 'string' },
        },
      },
    }),
  );
}
