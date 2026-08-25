'use client';

/**
 * React Query Hooks for Issues
 * Provides type-safe hooks for issues/tickets management
 */

import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  type UseQueryResult,
  type UseMutationResult,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  getMyIssues,
  getOpenIssues,
  searchIssues,
} from '@/lib/api/issues';
import { queryClient, queryKeys, handleQueryError } from '@/lib/query';
import type {
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  ListResponse,
  ItemResponse,
  IssueListParams,
} from '@/types/api';

/**
 * Hook to fetch a paginated list of issues
 * @param params - Pagination and filter parameters
 * @param enabled - Whether the query is enabled (default: true)
 * @returns Query result with issues list
 */
export function useIssuesList(
  params?: IssueListParams,
  enabled: boolean = true,
): UseQueryResult<ListResponse<Issue>, Error> {
  return useQuery({
    queryKey: queryKeys.issuesList(params),
    queryFn: () => getIssues(params),
    enabled,
    throwOnError: false,
  });
}

/**
 * Hook to fetch a single issue by ID
 * @param id - Issue ID
 * @param enabled - Whether the query is enabled (default: true)
 * @returns Query result with issue details
 */
export function useIssue(
  id: string,
  enabled: boolean = true,
): UseQueryResult<ItemResponse<Issue>, Error> {
  return useQuery({
    queryKey: queryKeys.issue(id),
    queryFn: () => getIssue(id),
    enabled: enabled && !!id,
    throwOnError: false,
  });
}

/**
 * Hook to fetch infinite paginated list of issues
 * Useful for implementing "load more" patterns
 * @param params - Initial pagination and filter parameters
 * @returns Infinite query result
 */
export function useIssuesInfinite(
  params?: Omit<IssueListParams, 'page'>,
): UseInfiniteQueryResult<ListResponse<Issue>, Error> {
  return useInfiniteQuery({
    queryKey: queryKeys.issuesInfinite(params),
    queryFn: ({ pageParam = 1 }) =>
      getIssues({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage, pages) => {
      const { pagination } = lastPage;
      if (pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    throwOnError: false,
  });
}

/**
 * Hook to fetch issues assigned to current user
 * @param params - Pagination and filter parameters
 * @param enabled - Whether the query is enabled (default: true)
 * @returns Query result with user's issues
 */
export function useMyIssues(
  params?: Omit<IssueListParams, 'assigneeId'>,
  enabled: boolean = true,
): UseQueryResult<ListResponse<Issue>, Error> {
  return useQuery({
    queryKey: queryKeys.myIssues(params),
    queryFn: () => getMyIssues(params),
    enabled,
    throwOnError: false,
  });
}

/**
 * Hook to fetch open issues (not closed)
 * @param params - Pagination and filter parameters
 * @param enabled - Whether the query is enabled (default: true)
 * @returns Query result with open issues
 */
export function useOpenIssues(
  params?: Omit<IssueListParams, 'status'>,
  enabled: boolean = true,
): UseQueryResult<ListResponse<Issue>, Error> {
  return useQuery({
    queryKey: queryKeys.openIssues(params),
    queryFn: () => getOpenIssues(params),
    enabled,
    throwOnError: false,
  });
}

/**
 * Hook to search for issues
 * @param query - Search query string
 * @param params - Additional filter parameters
 * @param enabled - Whether the query is enabled (default: true)
 * @returns Query result with search results
 */
export function useSearchIssues(
  query: string,
  params?: Omit<IssueListParams, 'search'>,
  enabled: boolean = true,
): UseQueryResult<ListResponse<Issue>, Error> {
  return useQuery({
    queryKey: queryKeys.searchIssues(query, params),
    queryFn: () => searchIssues(query, params),
    enabled: enabled && !!query.trim(),
    throwOnError: false,
  });
}

/**
 * Hook to create a new issue
 * Optimistically updates the issues list
 * @returns Mutation result with create function
 */
export function useCreateIssue(): UseMutationResult<
  ItemResponse<Issue>,
  Error,
  CreateIssueDTO
> {
  return useMutation({
    mutationFn: (data) => createIssue(data),
    onSuccess: (newIssue) => {
      // Invalidate list queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.issues(),
      });
    },
    onError: (error) => {
      handleQueryError(error);
    },
  });
}

/**
 * Hook to update an existing issue
 * Optimistically updates both the single issue and list queries
 * @returns Mutation result with update function
 */
export function useUpdateIssue(
  id: string,
): UseMutationResult<ItemResponse<Issue>, Error, UpdateIssueDTO> {
  return useMutation({
    mutationFn: (data) => updateIssue(id, data),
    onSuccess: (updatedIssue) => {
      // Update the specific issue in the cache
      queryClient.setQueryData(queryKeys.issue(id), updatedIssue);
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.issues(),
      });
    },
    onError: (error) => {
      handleQueryError(error);
    },
  });
}

/**
 * Hook to delete an issue
 * Removes the issue from cache and invalidates list queries
 * @param id - Issue ID to delete
 * @returns Mutation result with delete function
 */
export function useDeleteIssue(
  id: string,
): UseMutationResult<{ success: boolean }, Error, void> {
  return useMutation({
    mutationFn: () => deleteIssue(id),
    onSuccess: () => {
      // Remove the issue from cache
      queryClient.removeQueries({
        queryKey: queryKeys.issue(id),
      });
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.issues(),
      });
    },
    onError: (error) => {
      handleQueryError(error);
    },
  });
}
