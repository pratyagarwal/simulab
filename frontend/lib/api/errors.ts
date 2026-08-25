/**
 * API Error Handling
 * Custom error classes for different API failure scenarios
 */

/**
 * Base API Error class
 * Extends Error with HTTP response information
 */
export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if error is a validation error (422)
   */
  isValidationError(): boolean {
    return this.status === 422;
  }

  /**
   * Check if error is unauthorized (401)
   */
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is forbidden (403)
   */
  isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Check if error is not found (404)
   */
  isNotFound(): boolean {
    return this.status === 404;
  }
}

/**
 * Network Error class
 * Thrown when network request fails before reaching the server
 */
export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(`Network Error: ${message}`);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Validation Error class
 * Thrown when request validation fails (422)
 */
export class ValidationError extends APIError {
  public validationErrors: Record<string, string[]>;

  constructor(
    status: number,
    statusText: string,
    data?: unknown,
  ) {
    super(status, statusText, data);
    this.name = 'ValidationError';
    this.validationErrors = this.parseValidationErrors(data);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  private parseValidationErrors(
    data: unknown,
  ): Record<string, string[]> {
    if (
      typeof data === 'object' &&
      data !== null &&
      'errors' in data &&
      typeof data.errors === 'object'
    ) {
      return data.errors as Record<string, string[]>;
    }
    return {};
  }
}

/**
 * Unauthorized Error class
 * Thrown when user is not authenticated (401)
 */
export class UnauthorizedError extends APIError {
  constructor(status: number, statusText: string, data?: unknown) {
    super(status, statusText, data);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Type guard to check if error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Type guard to check if error is a NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard to check if error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}
