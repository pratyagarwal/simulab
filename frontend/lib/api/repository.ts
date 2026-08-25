/**
 * Repository API Endpoints
 * Functions for interacting with the repository/git system
 */

import { apiClient } from './client';
import type {
  Repository,
  Commit,
  CreateRepositoryDTO,
  ListResponse,
  ItemResponse,
} from '@/types/api';

/**
 * Get paginated list of repositories
 * @param params - Pagination parameters
 * @returns Paginated list of repositories
 */
export async function getRepositories(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<ListResponse<Repository>> {
  const queryString = new URLSearchParams();

  if (params) {
    if (params.page) queryString.append('page', String(params.page));
    if (params.pageSize) queryString.append('pageSize', String(params.pageSize));
    if (params.search) queryString.append('search', params.search);
  }

  const query = queryString.toString();
  const endpoint = `/repositories${query ? `?${query}` : ''}`;

  return apiClient.get(endpoint);
}

/**
 * Get a specific repository by ID
 * @param id - Repository ID
 * @returns Repository details
 */
export async function getRepository(id: string): Promise<ItemResponse<Repository>> {
  return apiClient.get(`/repositories/${id}`);
}

/**
 * Create a new repository
 * @param data - Repository creation data
 * @returns Created repository
 */
export async function createRepository(
  data: CreateRepositoryDTO,
): Promise<ItemResponse<Repository>> {
  return apiClient.post('/repositories', data);
}

/**
 * Get commits for a repository
 * @param repositoryId - Repository ID
 * @param params - Pagination parameters
 * @returns Paginated list of commits
 */
export async function getRepositoryCommits(
  repositoryId: string,
  params?: {
    page?: number;
    pageSize?: number;
    branch?: string;
  },
): Promise<ListResponse<Commit>> {
  const queryString = new URLSearchParams({
    repositoryId,
  });

  if (params) {
    if (params.page) queryString.append('page', String(params.page));
    if (params.pageSize) queryString.append('pageSize', String(params.pageSize));
    if (params.branch) queryString.append('branch', params.branch);
  }

  const query = queryString.toString();
  const endpoint = `/commits${query ? `?${query}` : ''}`;

  return apiClient.get(endpoint);
}

/**
 * Get a specific commit
 * @param commitId - Commit ID
 * @returns Commit details
 */
export async function getCommit(commitId: string): Promise<ItemResponse<Commit>> {
  return apiClient.get(`/commits/${commitId}`);
}

/**
 * Get commits for a specific branch
 * @param repositoryId - Repository ID
 * @param branch - Branch name
 * @param params - Pagination parameters
 * @returns Paginated list of commits on the branch
 */
export async function getBranchCommits(
  repositoryId: string,
  branch: string,
  params?: {
    page?: number;
    pageSize?: number;
  },
): Promise<ListResponse<Commit>> {
  return getRepositoryCommits(repositoryId, { ...params, branch });
}

/**
 * Search commits in a repository
 * @param query - Search query
 * @param repositoryId - Optional repository ID to limit search
 * @returns List of matching commits
 */
export async function searchCommits(
  query: string,
  repositoryId?: string,
): Promise<ListResponse<Commit>> {
  const queryString = new URLSearchParams({
    search: query,
  });

  if (repositoryId) {
    queryString.append('repositoryId', repositoryId);
  }

  return apiClient.get(`/commits?${queryString.toString()}`);
}

/**
 * Search repositories
 * @param query - Search query
 * @returns List of matching repositories
 */
export async function searchRepositories(
  query: string,
): Promise<ListResponse<Repository>> {
  return getRepositories({ search: query });
}
