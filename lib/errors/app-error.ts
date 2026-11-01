/**
 * @file lib/errors/app-error.ts
 * @description Single responsibility: Strongly-typed application error hierarchy for consistent API error mapping.
 */

export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UPSTREAM_AI_ERROR'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST';

/**
 * Base application error with HTTP status code and optional details payload.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: AppErrorCode;
  public readonly details?: unknown;

  public constructor(
    message: string,
    statusCode = 500,
    code: AppErrorCode = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when incoming request schema or business constraint validation fails.
 */
export class ValidationError extends AppError {
  public constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Thrown when client IP exceeds the configured request rate limit.
 */
export class RateLimitError extends AppError {
  public readonly retryAfterSeconds: number;

  public constructor(message = 'Too many requests. Please wait a moment.', retryAfterSeconds = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfterSeconds });
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Thrown when an external AI provider or cloud service fails or times out.
 */
export class UpstreamError extends AppError {
  public constructor(message: string, details?: unknown) {
    super(message, 502, 'UPSTREAM_AI_ERROR', details);
    this.name = 'UpstreamError';
  }
}

/**
 * Thrown when a requested resource or blueprint is not found.
 */
export class NotFoundError extends AppError {
  public constructor(message = 'The requested resource was not found.') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}
