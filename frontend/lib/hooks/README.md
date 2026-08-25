# React Query Hooks Module

This module provides a collection of pre-built React Query hooks for common data-fetching and mutation patterns in the SimuLab frontend.

## Architecture

### Files Structure

```
lib/hooks/
├── useIssues.ts  # Hooks for issues/tickets management
└── index.ts      # Central exports
```

## Available Hooks

### Query Hooks (Data Fetching)

Query hooks use React Query's `useQuery` for fetching data. They automatically handle:
- Caching and cache management
- Automatic refetching on stale data
- Background refetching on window focus/reconnect
- Loading and error states
- Retry logic with exponential backoff

#### `useIssuesList(params?, enabled?)`

Fetch a paginated list of issues with optional filtering and sorting.

```typescript
const { data, isLoading, error, isPending } = useIssuesList(
  {
    page: 1,
    pageSize: 20,
    status: 'open',
    priority: 'high',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  true // enabled flag (default: true)
);

// data structure:
// {
//   data: Issue[],
//   pagination: {
//     page: 1,
//     pageSize: 20,
//     total: 150,
//     totalPages: 8
//   }
// }
```

**Parameters:**
- `params?: IssueListParams` - Pagination and filter options
  - `page?: number` - Page number (1-indexed, default: 1)
  - `pageSize?: number` - Items per page (default: 20)
  - `status?: string` - Filter by status
  - `priority?: string` - Filter by priority
  - `assigneeId?: string` - Filter by assignee
  - `search?: string` - Search query
  - `sortBy?: string` - Sort field
  - `sortOrder?: 'asc' | 'desc'` - Sort direction
- `enabled?: boolean` - Enable/disable the query (default: true)

**Returns:** `UseQueryResult<ListResponse<Issue>>`

#### `useIssue(id, enabled?)`

Fetch a single issue by ID.

```typescript
const { data, isLoading, error } = useIssue('issue-123', true);

// data structure:
// {
//   data: Issue
// }
```

**Parameters:**
- `id: string` - Issue ID
- `enabled?: boolean` - Enable/disable the query (default: true)

**Returns:** `UseQueryResult<ItemResponse<Issue>>`

#### `useIssuesInfinite(params?)`

Fetch issues using infinite query pattern for "load more" pagination.

```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useIssuesInfinite({
  status: 'open',
  pageSize: 20,
});

// Trigger loading next page
return (
  <>
    {data?.pages.map((page) =>
      page.data.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))
    )}
    {hasNextPage && (
      <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
        Load More
      </button>
    )}
  </>
);
```

**Parameters:**
- `params?: Omit<IssueListParams, 'page'>` - Filter and sort options (page is handled automatically)

**Returns:** `UseInfiniteQueryResult<ListResponse<Issue>>`

#### `useMyIssues(params?, enabled?)`

Fetch issues assigned to the current user.

```typescript
const { data, isLoading } = useMyIssues(
  { pageSize: 30 },
  isUserLoggedIn // Only fetch if user is logged in
);
```

**Parameters:**
- `params?: Omit<IssueListParams, 'assigneeId'>` - Filter and sort options
- `enabled?: boolean` - Enable/disable the query

**Returns:** `UseQueryResult<ListResponse<Issue>>`

#### `useOpenIssues(params?, enabled?)`

Fetch open (non-closed) issues.

```typescript
const { data } = useOpenIssues({
  priority: 'high',
  sortBy: 'createdAt',
  sortOrder: 'desc',
});
```

**Parameters:**
- `params?: Omit<IssueListParams, 'status'>` - Filter and sort options
- `enabled?: boolean` - Enable/disable the query

**Returns:** `UseQueryResult<ListResponse<Issue>>`

#### `useSearchIssues(query, params?, enabled?)`

Search for issues using a search query.

```typescript
const [searchTerm, setSearchTerm] = useState('');

const { data, isLoading } = useSearchIssues(
  searchTerm,
  { pageSize: 20 },
  searchTerm.length >= 2 // Only search if query is 2+ chars
);
```

**Parameters:**
- `query: string` - Search query string (must be non-empty to trigger)
- `params?: Omit<IssueListParams, 'search'>` - Additional filter options
- `enabled?: boolean` - Enable/disable the query

**Returns:** `UseQueryResult<ListResponse<Issue>>`

### Mutation Hooks (Create/Update/Delete)

Mutation hooks use React Query's `useMutation` for modifying data. They provide:
- Async operations with loading states
- Automatic cache invalidation
- Optimistic updates (when applicable)
- Error handling

#### `useCreateIssue()`

Create a new issue.

```typescript
const { mutate, mutateAsync, isPending, error } = useCreateIssue();

// Using mutate (fire and forget)
const handleCreate = (formData: CreateIssueDTO) => {
  mutate(formData, {
    onSuccess: (newIssue) => {
      console.log('Issue created:', newIssue);
    },
    onError: (error) => {
      console.error('Failed to create:', error);
    },
  });
};

// Using mutateAsync (await)
const handleCreateAsync = async (formData: CreateIssueDTO) => {
  try {
    const newIssue = await mutateAsync(formData);
    console.log('Created:', newIssue);
  } catch (error) {
    console.error('Failed:', error);
  }
};
```

**Parameters:** `CreateIssueDTO`
```typescript
{
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string;
}
```

**Returns:** `UseMutationResult<ItemResponse<Issue>, Error, CreateIssueDTO>`

**Side Effects:**
- Invalidates all issues list queries on success
- Calls `handleQueryError()` on error

#### `useUpdateIssue(id)`

Update an existing issue (partial update).

```typescript
const { mutate, isPending } = useUpdateIssue('issue-123');

const handleUpdate = (updates: UpdateIssueDTO) => {
  mutate(updates, {
    onSuccess: (updated) => {
      console.log('Issue updated:', updated);
    },
  });
};
```

**Parameters:**
- `id: string` - Issue ID to update

**Mutation Data:** `UpdateIssueDTO` (partial fields)
```typescript
{
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string;
}
```

**Returns:** `UseMutationResult<ItemResponse<Issue>, Error, UpdateIssueDTO>`

**Side Effects:**
- Updates the specific issue in cache
- Invalidates all issues list queries
- Calls `handleQueryError()` on error

#### `useDeleteIssue(id)`

Delete an issue.

```typescript
const { mutate, isPending } = useDeleteIssue('issue-123');

const handleDelete = () => {
  mutate(undefined, {
    onSuccess: () => {
      console.log('Issue deleted');
      navigate('/issues'); // Redirect after deletion
    },
  });
};
```

**Parameters:**
- `id: string` - Issue ID to delete

**Returns:** `UseMutationResult<{ success: boolean }, Error, void>`

**Side Effects:**
- Removes the issue from cache
- Invalidates all issues list queries
- Calls `handleQueryError()` on error

## Usage Patterns

### Basic List Display

```typescript
import { useIssuesList } from '@/lib/hooks';

function IssuesList() {
  const { data, isLoading, error } = useIssuesList({ pageSize: 20 });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data?.data.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
      <Pagination
        current={data?.pagination.page || 1}
        total={data?.pagination.totalPages || 1}
      />
    </div>
  );
}
```

### Infinite Scroll / Load More

```typescript
import { useIssuesInfinite } from '@/lib/hooks';

function IssuesWithLoadMore() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useIssuesInfinite({ pageSize: 20 });

  const allIssues = data?.pages.flatMap((page) => page.data) || [];

  return (
    <InfiniteScroll
      dataLength={allIssues.length}
      next={fetchNextPage}
      hasMore={hasNextPage || false}
      loader={<LoadingSpinner />}
    >
      {allIssues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </InfiniteScroll>
  );
}
```

### Search with Debounce

```typescript
import { useMemo } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce'; // hypothetical
import { useSearchIssues } from '@/lib/hooks';

function IssueSearch() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data, isLoading } = useSearchIssues(
    debouncedSearch,
    {},
    debouncedSearch.length >= 2
  );

  return (
    <>
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search issues..."
      />
      {isLoading && <LoadingSpinner />}
      {data?.data.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </>
  );
}
```

### Create Form with Mutation

```typescript
import { useCreateIssue } from '@/lib/hooks';
import { isValidationError } from '@/lib/api';

function CreateIssueForm() {
  const [formData, setFormData] = useState<CreateIssueDTO>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const { mutate, isPending } = useCreateIssue();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData, {
      onSuccess: () => {
        setFormData({});
        showSuccessMessage('Issue created');
      },
      onError: (error) => {
        if (isValidationError(error)) {
          setFieldErrors(error.fieldErrors);
        } else {
          showErrorMessage('Failed to create issue');
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.title || ''}
        onChange={(e) =>
          setFormData({ ...formData, title: e.target.value })
        }
      />
      {fieldErrors.title && (
        <ErrorMessage message={fieldErrors.title[0]} />
      )}
      <button type="submit" disabled={isPending}>
        Create
      </button>
    </form>
  );
}
```

### Conditional Queries

```typescript
function UserIssuesDashboard({ userId }: { userId?: string }) {
  // Only fetch if userId is provided
  const { data } = useIssuesList(
    { assigneeId: userId },
    !!userId // enabled condition
  );

  if (!userId) {
    return <div>Please log in to see your issues</div>;
  }

  return <IssuesList issues={data?.data || []} />;
}
```

## Configuration

Hooks use the global React Query configuration from `lib/query/client.ts`:

- **Cache Time (gcTime)**: 10 minutes - Unused queries are garbage collected
- **Stale Time**: 5 minutes - Queries become stale after 5 minutes
- **Retry Logic**:
  - Client errors (4xx): No retry
  - Server errors (5xx) / Network: Up to 3 retries with exponential backoff
- **Refetch Triggers**:
  - On window focus
  - On reconnect
  - On mount if stale

## Error Handling

All mutation hooks automatically call `handleQueryError()` to provide user-friendly error messages. In components, handle specific error types:

```typescript
import { isValidationError, isAPIError } from '@/lib/api';

const { mutate } = useCreateIssue();

mutate(formData, {
  onError: (error) => {
    if (isValidationError(error)) {
      // Handle field validation errors
      updateFormErrors(error.fieldErrors);
    } else if (isAPIError(error)) {
      if (error.isUnauthorized()) {
        redirectToLogin();
      } else if (error.isForbidden()) {
        showForbiddenMessage();
      }
    }
  },
});
```

## Related Documentation

- [API Client Module](../api/README.md) - Endpoint functions and error handling
- [Query Configuration](../query/README.md) - React Query client setup and query keys
- [Type Definitions](../../types/api.ts) - Complete API type definitions
