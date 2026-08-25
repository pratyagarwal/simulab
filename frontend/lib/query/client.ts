/**
 * React Query Configuration
 * Centralized QueryClient setup with sensible defaults
 */

import { QueryClient } from '@tanstack/react-query';
import { config } from '@/lib/config';
import { isAPIError, getErrorMessage } from '@/lib/api/errors';

/**
 * Create configured QueryClient instance
 * This is the central cache for all server state
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh (in milliseconds)
      staleTime: 1000 * 60 * 5, // 5 minutes

      // How long to keep unused data in cache
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)

      // Retry failed requests with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (isAPIError(error) && error.isClientError()) {
          return false;
        }
        // Retry up to 3 times on 5xx errors and network errors
        return failureCount < 3;
      },

      // Delay between retries (exponential backoff)
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus
      refetchOnWindowFocus: true,

      // Refetch on mount if stale
      refetchOnMount: true,

      // Refetch on reconnect
      refetchOnReconnect: true,
    },

    mutations: {
      // Retry failed mutations once
      retry: (failureCount, error) => {
        // Don't retry on 4xx client errors
        if (isAPIError(error) && error.isClientError()) {
          return false;
        }
        // Retry once on network/5xx errors
        return failureCount < 1;
      },

      // Delay before retrying mutations
      retryDelay: 1000,
    },
  },
});

/**
 * Query key factory
 * Centralized query key definitions for type-safe query invalidation
 *
 * Usage:
 * - useQuery({ queryKey: issueKeys.all(), ... })
 * - queryClient.invalidateQueries({ queryKey: issueKeys.lists() })
 */
export const queryKeys = {
  all: () => ['queries'] as const,

  // Issues queries
  issues: () => [...queryKeys.all(), 'issues'] as const,
  issuesList: (params?: Record<string, unknown>) =>
    [...queryKeys.issues(), 'list', { ...params }] as const,
  issuesInfinite: (params?: Record<string, unknown>) =>
    [...queryKeys.issues(), 'infinite', { ...params }] as const,
  issuesDetail: () => [...queryKeys.issues(), 'detail'] as const,
  issue: (id: string) =>
    [...queryKeys.issuesDetail(), { id }] as const,
  myIssues: (params?: Record<string, unknown>) =>
    [...queryKeys.issues(), 'my', { ...params }] as const,
  openIssues: (params?: Record<string, unknown>) =>
    [...queryKeys.issues(), 'open', { ...params }] as const,
  searchIssues: (query: string, params?: Record<string, unknown>) =>
    [...queryKeys.issues(), 'search', { query, ...params }] as const,

  // Chat queries
  chat: () => [...queryKeys.all(), 'chat'] as const,
  messages: () => [...queryKeys.chat(), 'messages'] as const,
  messagesList: (channelId: string, params?: Record<string, unknown>) =>
    [...queryKeys.messages(), { channelId, ...params }] as const,
  channels: () => [...queryKeys.chat(), 'channels'] as const,
  channel: (id: string) =>
    [...queryKeys.channels(), { id }] as const,

  // Repository queries
  repository: () => [...queryKeys.all(), 'repository'] as const,
  repositoryList: () => [...queryKeys.repository(), 'list'] as const,
  repositoryDetail: () => [...queryKeys.repository(), 'detail'] as const,
  repo: (id: string) =>
    [...queryKeys.repositoryDetail(), { id }] as const,
  commits: (repoId: string) =>
    [...queryKeys.repo(repoId), 'commits'] as const,
} as const;

/**
 * Default error handler for queries
 * Logs errors and converts to user-friendly messages
 */
export function handleQueryError(error: unknown): string {
  if (isAPIError(error)) {
    if (error.isForbidden()) {
      return 'You do not have permission to perform this action';
    }
    if (error.isNotFound()) {
      return 'The requested resource was not found';
    }
    if (error.isUnauthorized()) {
      return 'Your session has expired. Please log in again';
    }
    if (error.isValidationError()) {
      return 'The request contains invalid data';
    }
    if (error.isServerError()) {
      return 'The server encountered an error. Please try again later';
    }
  }

  const message = getErrorMessage(error);
  return message || 'An unexpected error occurred';
}

/**
 * Re-export for app configuration
 */
export default queryClient;
