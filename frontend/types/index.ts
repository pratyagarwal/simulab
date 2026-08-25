// Types index - export all types here for convenient importing
// Usage: import type { User, Message } from '@/types'

// API types and domain models
export type {
  // Response wrappers
  APIResponse,
  PaginatedResponse,
  ErrorResponse,
  ValidationErrorResponse,
  // Domain models
  User,
  Team,
  Channel,
  Message,
  Thread,
  Issue,
  IssueComment,
  Repository,
  Commit,
  Attachment,
  // Request DTOs
  CreateIssueDTO,
  UpdateIssueDTO,
  CreateMessageDTO,
  CreateCommentDTO,
  UpdateCommentDTO,
  CreateChannelDTO,
  // Query parameters
  PaginationParams,
  IssueListParams,
  MessageListParams,
  // Response type aliases
  ListResponse,
  ItemResponse,
  CreateResponse,
  UpdateResponse,
  DeleteResponse,
  // Utility types
  ResponseData,
  BaseEntity,
  Timestamps,
} from './api'
