/**
 * API Type Definitions
 * Shared TypeScript types for API contracts between frontend and backend
 * This file should mirror the backend's API response structures
 */

/**
 * Base API Response Wrapper
 * Standard format for all API responses
 */
export interface APIResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    version: string;
  };
}

/**
 * Paginated Response Wrapper
 * Used for list endpoints that support pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Error Response Format
 * Standard error response from API
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Validation Error Response
 * 422 Unprocessable Entity
 */
export interface ValidationErrorResponse {
  errors: Record<string, string[]>;
  message: string;
}

// ============================================================================
// Domain Models
// ============================================================================

/**
 * User Entity
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'agent';
  createdAt: string;
  updatedAt: string;
}

/**
 * Team Entity
 */
export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Chat Channel Entity
 */
export interface Channel {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPrivate: boolean;
  teamId: string;
  createdBy: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Chat Message Entity
 */
export interface Message {
  id: string;
  content: string;
  channelId: string;
  threadId?: string;
  authorId: string;
  author: User;
  reactions?: Record<string, string[]>; // emoji -> userIds
  attachments?: Attachment[];
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Chat Thread Entity
 */
export interface Thread {
  id: string;
  messageId: string; // Parent message
  replyCount: number;
  lastReplyAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Issue Entity (from Jira-like system)
 */
export interface Issue {
  id: string;
  identifier: string; // e.g., "ENG-142"
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed' | 'backlog';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: User;
  assigneeId?: string;
  reporter: User;
  reporterId: string;
  labels: string[];
  components?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

/**
 * Issue Comment Entity
 */
export interface IssueComment {
  id: string;
  issueId: string;
  content: string;
  authorId: string;
  author: User;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Repository Entity
 */
export interface Repository {
  id: string;
  name: string;
  slug: string;
  description?: string;
  url: string;
  defaultBranch: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Git Commit Entity
 */
export interface Commit {
  id: string;
  hash: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  parentHashes: string[];
  filesChanged?: number;
  insertions?: number;
  deletions?: number;
}

/**
 * File/Asset Entity
 */
export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

// ============================================================================
// Request DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Create Issue Request
 */
export interface CreateIssueDTO {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string;
  labels?: string[];
  dueDate?: string;
}

/**
 * Update Issue Request
 */
export interface UpdateIssueDTO {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'closed' | 'backlog';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string | null;
  labels?: string[];
  dueDate?: string | null;
}

/**
 * Create Message Request
 */
export interface CreateMessageDTO {
  content: string;
  threadId?: string;
  attachmentIds?: string[];
}

/**
 * Create Comment Request
 */
export interface CreateCommentDTO {
  content: string;
}

/**
 * Update Comment Request
 */
export interface UpdateCommentDTO {
  content: string;
}

/**
 * Create Channel Request
 */
export interface CreateChannelDTO {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

// ============================================================================
// Query Parameters
// ============================================================================

/**
 * Pagination Query Parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Issue List Query Parameters
 */
export interface IssueListParams extends PaginationParams {
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
}

/**
 * Message List Query Parameters
 */
export interface MessageListParams extends PaginationParams {
  channelId?: string;
  threadId?: string;
  search?: string;
}

// ============================================================================
// Response Wrappers
// ============================================================================

/**
 * Successful List Response
 */
export type ListResponse<T> = PaginatedResponse<T>;

/**
 * Successful Single Item Response
 */
export type ItemResponse<T> = APIResponse<T>;

/**
 * Successful Create Response
 */
export type CreateResponse<T> = APIResponse<T>;

/**
 * Successful Update Response
 */
export type UpdateResponse<T> = APIResponse<T>;

/**
 * Successful Delete Response
 */
export interface DeleteResponse {
  success: true;
  message?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract the data type from an API response
 */
export type ResponseData<T> = T extends APIResponse<infer U>
  ? U
  : T extends PaginatedResponse<infer U>
    ? U[]
    : never;

/**
 * Common fields for entities
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Timestamp fields
 */
export interface Timestamps {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
