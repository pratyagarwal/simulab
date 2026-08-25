# API Client Module

This module provides a centralized, type-safe API client for communicating with the backend SimuLab API. It includes comprehensive error handling, request/response serialization, and integration with React Query.

## Architecture

### Files Structure

```
lib/api/
├── client.ts        # Base APIClient class and singleton instance
├── errors.ts        # Custom error classes and type guards
├── issues.ts        # Issue/ticket management endpoints
├── chat.ts          # Chat and messaging endpoints
├── repository.ts    # Repository and commit endpoints
└── index.ts         # Central exports
```

## Core Components

### APIClient (`client.ts`)

The `APIClient` is a wrapper around the native Fetch API that provides:

- **Automatic JSON serialization**: Converts request/response bodies to/from JSON
- **Base URL configuration**: All requests are prefixed with `NEXT_PUBLIC_API_URL`
- **Error handling**: Throws appropriate error types based on HTTP status codes
- **Request/Response headers**: Automatically sets `Content-Type: application/json`

#### Usage

```typescript
import { apiClient } from '@/lib/api';

// GET request
const issues = await apiClient.get('/issues?page=1');

// POST request with body
const newIssue = await apiClient.post('/issues', {
  title: 'New Issue',
  description: 'Issue description',
});

// PATCH request for updates
const updated = await apiClient.patch('/issues/123', {
  status: 'in_progress',
});

// DELETE request
await apiClient.delete('/issues/123');
```

#### Methods

- `get<T>(endpoint: string, options?: FetchOptions): Promise<T>`
- `post<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T>`
- `patch<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T>`
- `put<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T>`
- `delete<T>(endpoint: string, options?: FetchOptions): Promise<T>`

### Error Handling (`errors.ts`)

The module provides several custom error classes for different scenarios:

#### Error Classes

**APIError** - Base class for all API errors
```typescript
- `status: number` - HTTP status code
- `statusText: string` - HTTP status text (e.g., "Not Found")
- `response?: unknown` - Response body from server
- Methods:
  - `isClientError()` - True if 4xx status
  - `isServerError()` - True if 5xx status
  - `isNotFound()` - True if 404
  - `isUnauthorized()` - True if 401
  - `isForbidden()` - True if 403
  - `isValidationError()` - True if 422
```

**NetworkError** - Network request failed (no response from server)
```typescript
- `originalError: Error` - Original network error
- Used when fetch() throws before getting a response
```

**ValidationError** - Request validation failed (422 Unprocessable Entity)
```typescript
- `fieldErrors: Record<string, string[]>` - Field-level error messages
- `message: string` - General validation error message
```

**UnauthorizedError** - Authentication required (401 Unauthorized)
```typescript
- Indicates session has expired or credentials are missing
```

#### Type Guards

Use these functions to narrow error types:

```typescript
import { isAPIError, isNetworkError, isValidationError } from '@/lib/api';

try {
  // ...
} catch (error) {
  if (isValidationError(error)) {
    // Handle field-level validation errors
    console.log(error.fieldErrors);
  } else if (isAPIError(error)) {
    // Handle other API errors
    console.log(error.status, error.statusText);
  } else if (isNetworkError(error)) {
    // Handle network failures
    console.log('Network error:', error.originalError);
  }
}
```

#### Error Message Extraction

```typescript
import { getErrorMessage } from '@/lib/api';

const errorMessage = getErrorMessage(error);
// Returns user-friendly error message or 'An unexpected error occurred'
```

## Endpoint Functions

### Issues (`issues.ts`)

Functions for managing issues/tickets:

```typescript
// Get paginated list of issues
getIssues(params?: IssueListParams): Promise<ListResponse<Issue>>

// Get a single issue
getIssue(id: string): Promise<ItemResponse<Issue>>

// Create a new issue
createIssue(data: CreateIssueDTO): Promise<ItemResponse<Issue>>

// Update an issue (partial update)
updateIssue(id: string, data: UpdateIssueDTO): Promise<ItemResponse<Issue>>

// Delete an issue
deleteIssue(id: string): Promise<{ success: boolean }>

// Get issues assigned to current user
getMyIssues(params?: IssueListParams): Promise<ListResponse<Issue>>

// Get open issues (not closed)
getOpenIssues(params?: IssueListParams): Promise<ListResponse<Issue>>

// Search issues
searchIssues(query: string, params?: IssueListParams): Promise<ListResponse<Issue>>
```

### Chat (`chat.ts`)

Functions for managing chat channels and messages:

```typescript
// Get all channels
getChannels(): Promise<ListResponse<Channel>>

// Get a specific channel
getChannel(channelId: string): Promise<ItemResponse<Channel>>

// Get paginated messages in a channel
getChannelMessages(channelId: string, params?: MessageListParams): Promise<ListResponse<Message>>

// Send a message to a channel
sendMessage(channelId: string, data: CreateMessageDTO): Promise<ItemResponse<Message>>

// Get a specific message
getMessage(messageId: string): Promise<ItemResponse<Message>>

// Get paginated messages in a thread
getThreadMessages(threadId: string, params?: MessageListParams): Promise<ListResponse<Message>>

// Search messages globally or in a channel
searchMessages(query: string, channelId?: string): Promise<ListResponse<Message>>

// Add emoji reaction to a message
addReaction(messageId: string, emoji: string): Promise<{ success: boolean }>

// Remove emoji reaction from a message
removeReaction(messageId: string, emoji: string): Promise<{ success: boolean }>
```

**Note**: Real-time messaging via WebSocket is handled separately.

### Repository (`repository.ts`)

Functions for managing repositories and commits:

```typescript
// Get paginated list of repositories
getRepositories(params?: { page?: number; pageSize?: number; search?: string }): Promise<ListResponse<Repository>>

// Get a specific repository
getRepository(id: string): Promise<ItemResponse<Repository>>

// Create a new repository
createRepository(data: CreateRepositoryDTO): Promise<ItemResponse<Repository>>

// Get paginated commits for a repository
getRepositoryCommits(repositoryId: string, params?: { page?: number; pageSize?: number; branch?: string }): Promise<ListResponse<Commit>>

// Get a specific commit
getCommit(commitId: string): Promise<ItemResponse<Commit>>

// Get commits for a specific branch
getBranchCommits(repositoryId: string, branch: string, params?: { page?: number; pageSize?: number }): Promise<ListResponse<Commit>>

// Search commits in repositories
searchCommits(query: string, repositoryId?: string): Promise<ListResponse<Commit>>

// Search repositories
searchRepositories(query: string): Promise<ListResponse<Repository>>
```

## Type Definitions

All endpoint functions use strongly-typed request and response DTOs. Key types include:

```typescript
// Response wrappers
interface APIResponse<T> {
  data: T;
  meta?: { timestamp: string; version: string };
}

interface ListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Domain models
interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  // ...
}

interface Message {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  reactions: Record<string, number>; // emoji -> count
  createdAt: string;
  updatedAt: string;
  // ...
}
```

See `types/api.ts` for complete type definitions.

## Integration with React Query

The API client is designed to work seamlessly with React Query hooks.

### Basic Query Usage

```typescript
import { useQuery } from '@tanstack/react-query';
import { getIssues } from '@/lib/api/issues';
import { queryKeys } from '@/lib/query';

function IssuesList() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.issuesList(),
    queryFn: () => getIssues(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.data.map((issue) => (
        <li key={issue.id}>{issue.title}</li>
      ))}
    </ul>
  );
}
```

### Using Provided Hooks

It's recommended to use the pre-built hooks in `lib/hooks/useIssues.ts` instead of manually creating queries:

```typescript
import { useIssuesList, useCreateIssue } from '@/lib/hooks';

function IssuesList() {
  const { data, isLoading, error } = useIssuesList();
  const createMutation = useCreateIssue();

  // ...
}
```

These hooks handle:
- Proper query key management
- Cache invalidation strategies
- Error handling via `handleQueryError()`
- Optimistic updates for mutations

## Environment Configuration

API configuration is managed via environment variables:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The `NEXT_PUBLIC_` prefix makes it available to the browser. Update this to point to your backend API server.

See `.env.example` for all available configuration options.

## Error Handling Patterns

### In React Components

```typescript
import { useQuery } from '@tanstack/react-query';
import { getIssue } from '@/lib/api';
import { isAPIError } from '@/lib/api/errors';

function IssueDetail({ id }: { id: string }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => getIssue(id),
    throwOnError: false, // Prevent throwing, handle in component
  });

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    if (isAPIError(error) && error.isNotFound()) {
      return <div>Issue not found</div>;
    }
    if (isAPIError(error) && error.isUnauthorized()) {
      return <div>Please log in to view this issue</div>;
    }
    return <div>Error loading issue</div>;
  }

  return <div>{data?.data.title}</div>;
}
```

### In Mutations

```typescript
const createMutation = useMutation({
  mutationFn: (data: CreateIssueDTO) => createIssue(data),
  onError: (error) => {
    if (isValidationError(error)) {
      // Display field-level errors
      console.log(error.fieldErrors);
    } else {
      console.error('Failed to create issue');
    }
  },
  onSuccess: (newIssue) => {
    // Invalidate and refetch lists
    queryClient.invalidateQueries({
      queryKey: queryKeys.issues(),
    });
  },
});
```

## Best Practices

1. **Always use React Query hooks** instead of calling endpoint functions directly in components
2. **Use provided query key factories** from `lib/query/client.ts` for consistent cache management
3. **Handle errors appropriately** using error type guards and the `handleQueryError()` utility
4. **Use `throwOnError: false`** in queries to handle errors in the component rather than with error boundaries
5. **Leverage mutation callbacks** (`onSuccess`, `onError`) for cache updates and side effects
6. **Keep endpoint functions simple** - they should only call the API, let React Query handle caching
7. **Use TypeScript strict mode** to catch type errors at compile time

## Related Documentation

- [React Query Hooks](../hooks/README.md) - Hook patterns and usage
- [Type Definitions](../../types/api.ts) - Complete API type definitions
- [Query Configuration](../query/README.md) - React Query client setup
