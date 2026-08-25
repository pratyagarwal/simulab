/**
 * API Module Exports
 * Central export point for all API-related utilities
 */

export { apiClient } from './client';
export type { FetchOptions } from './client';

export {
  APIError,
  NetworkError,
  ValidationError,
  UnauthorizedError,
  isAPIError,
  isNetworkError,
  isValidationError,
  getErrorMessage,
} from './errors';
