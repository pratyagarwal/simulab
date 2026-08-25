/**
 * API Client
 * Base fetch wrapper with type safety and error handling
 */

import { config } from '@/lib/config';
import {
  APIError,
  NetworkError,
  ValidationError,
  UnauthorizedError,
} from './errors';

/**
 * Fetch options with caching support
 */
export interface FetchOptions extends RequestInit {
  // No additional options needed - using native RequestInit
}

/**
 * API Client class
 * Provides typed methods for HTTP requests
 */
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Make a typed fetch request
   * @template T - Response type
   * @param endpoint - API endpoint path (relative to baseURL)
   * @param options - Fetch options
   * @returns Parsed JSON response
   * @throws APIError, NetworkError, or ValidationError
   */
  private async request<T>(
    endpoint: string,
    options?: FetchOptions,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      // Handle non-2xx responses
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Parse response
      const data = (await response.json()) as T;
      return data;
    } catch (error) {
      // Re-throw API errors as-is
      if (
        error instanceof APIError ||
        error instanceof NetworkError ||
        error instanceof ValidationError ||
        error instanceof UnauthorizedError
      ) {
        throw error;
      }

      // Wrap other errors as NetworkError
      if (error instanceof Error) {
        throw new NetworkError(error.message, error);
      }

      throw new NetworkError('Unknown error occurred');
    }
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      // Response is not JSON, use empty data
    }

    // Handle specific status codes
    switch (response.status) {
      case 401:
        throw new UnauthorizedError(
          response.status,
          response.statusText,
          data,
        );
      case 422:
        throw new ValidationError(response.status, response.statusText, data);
      default:
        throw new APIError(response.status, response.statusText, data);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

/**
 * Singleton API client instance
 * Use this throughout the app instead of creating new instances
 */
export const apiClient = new APIClient(config.apiUrl);

export default apiClient;
