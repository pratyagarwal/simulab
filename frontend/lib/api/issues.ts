/**
 * Issues API Endpoints
 * Functions for interacting with the issues/tickets system
 */

import { apiClient } from './client';
import type {
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  ListResponse,
  ItemResponse,
  IssueListParams,
} from '@/types/api';

/**
 * Get paginated list of issues
 * @param params - Pagination and filter parameters
 * @returns Paginated list of issues
 */
export async function getIssues(
  params?: IssueListParams,
): Promise<ListResponse<Issue>> {
  const queryString = new URLSearchParams();

  if (params) {
    if (params.page) queryString.append('page', String(params.page));
    if (params.pageSize) queryString.append('pageSize', String(params.pageSize));
    if (params.status) queryString.append('status', params.status);
    if (params.priority) queryString.append('priority', params.priority);
    if (params.assigneeId) queryString.append('assigneeId', params.assigneeId);
    if (params.search) queryString.append('search', params.search);
    if (params.sortBy) queryString.append('sortBy', params.sortBy);
    if (params.sortOrder) queryString.append('sortOrder', params.sortOrder);
  }

  const query = queryString.toString();
  const endpoint = `/issues${query ? `?${query}` : ''}`;

  return apiClient.get(endpoint);
}

/**
 * Get a single issue by ID
 * @param id - Issue ID
 * @returns Single issue
 */
export async function getIssue(id: string): Promise<ItemResponse<Issue>> {
  return apiClient.get(`/issues/${id}`);
}

/**
 * Create a new issue
 * @param data - Issue creation data
 * @returns Created issue
 */
export async function createIssue(
  data: CreateIssueDTO,
): Promise<ItemResponse<Issue>> {
  return apiClient.post('/issues', data);
}

/**
 * Update an existing issue
 * @param id - Issue ID
 * @param data - Issue update data (partial)
 * @returns Updated issue
 */
export async function updateIssue(
  id: string,
  data: UpdateIssueDTO,
): Promise<ItemResponse<Issue>> {
  return apiClient.patch(`/issues/${id}`, data);
}

/**
 * Delete an issue
 * @param id - Issue ID
 * @returns Success response
 */
export async function deleteIssue(id: string): Promise<{ success: boolean }> {
  return apiClient.delete(`/issues/${id}`);
}

/**
 * Get issues assigned to current user
 * @returns List of issues assigned to user
 */
export async function getMyIssues(
  params?: IssueListParams,
): Promise<ListResponse<Issue>> {
  return getIssues({ ...params, assigneeId: 'me' });
}

/**
 * Get open issues (not closed)
 * @returns List of open issues
 */
export async function getOpenIssues(
  params?: IssueListParams,
): Promise<ListResponse<Issue>> {
  return getIssues({
    ...params,
    status: 'open,in_progress,backlog',
  });
}

/**
 * Search issues
 * @param query - Search query
 * @returns List of matching issues
 */
export async function searchIssues(
  query: string,
  params?: Omit<IssueListParams, 'search'>,
): Promise<ListResponse<Issue>> {
  return getIssues({ ...params, search: query });
}
