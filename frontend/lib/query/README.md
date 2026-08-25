# React Query Configuration Module

This module provides centralized React Query setup, configuration, and utilities for managing server state throughout the SimuLab frontend application.

## Architecture

### Files Structure

```
lib/query/
├── client.ts    # QueryClient configuration and query key factory
├── provider.tsx # QueryProvider component wrapper
├── index.ts     # Central exports
└── README.md    # This file
```

## Core Components

### QueryClient Configuration (`client.ts`)

The `QueryClient` is configured with sensible defaults for server state management:

```typescript
import { queryClient, queryKeys, handleQueryError } from '@/lib/query';
```

#### Default Query Options

```typescript
{
  staleTime: 5 * 60 * 1000,        // 5 minutes
  gcTime: 10 * 60 * 1000,          // 10 minutes (formerly cacheTime)
  retry: (failureCount, error) => {
    // Don't retry 4xx client errors
    if (isAPIError(error) && error.isClientError()) return false;
    // Retry up to 3 times on 5xx and network errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex) =>
    Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  refetchOnWindowFocus: true,      // Refetch when window regains focus
  refetchOnMount: true,            // Refetch when component mounts
  refetchOnReconnect: true,        // Refetch when reconnecting
}
```

#### Default Mutation Options

```typescript
{
  retry: (failureCount, error) => {
    // Don't retry 4xx client errors
    if (isAPIError(error) && error.isClientError()) return false;
    // Retry once on 5xx and network errors
    return failureCount < 1;
  },
  retryDelay: 1000,
}
```

### Query Key Factory

The `queryKeys` object provides type-safe, hierarchical query key definitions:

```typescript
// Root level
queryKeys.all()                              // ['queries']

// Issues queries
queryKeys.issues()                           // ['queries', 'issues']
queryKeys.issuesList(params)                 // ['queries', 'issues', 'list', {...params}]
queryKeys.issuesInfinite(params)             // ['queries', 'issues', 'infinite', {...params}]
queryKeys.issue(id)                          // ['queries', 'issues', 'detail', {id}]
queryKeys.myIssues(params)                   // ['queries', 'issues', 'my', {...params}]
queryKeys.openIssues(params)                 // ['queries', 'issues', 'open', {...params}]
queryKeys.searchIssues(query, params)        // ['queries', 'issues', 'search', {query, ...params}]

// Chat queries
queryKeys.chat()                             // ['queries', 'chat']
queryKeys.channels()                         // ['queries', 'chat', 'channels']
queryKeys.channel(id)                        // ['queries', 'chat', 'channels', {id}]
queryKeys.messages()                         // ['queries', 'chat', 'messages']
queryKeys.messagesList(channelId, params)    // ['queries', 'chat', 'messages', {channelId, ...params}]

// Repository queries
queryKeys.repository()                       // ['queries', 'repository']
queryKeys.repo(id)                           // ['queries', 'repository', 'detail', {id}]
queryKeys.commits(repoId)                    // ['queries', 'repository', 'detail', {repoId}, 'commits']
```

#### Query Key Best Practices

1. **Always use the factory** to ensure consistency:
   ```typescript
   // Good
   useQuery({
     queryKey: queryKeys.issue('123'),
     queryFn: () => getIssue('123'),
   });

   // Bad - manual key creation
   useQuery({
     queryKey: ['issue', '123'],
     queryFn: () => getIssue('123'),
   });
   ```

2. **Invalidate by prefix** to update multiple related queries:
   ```typescript
   // Invalidate all issue lists (but not single issues)
   queryClient.invalidateQueries({
     queryKey: queryKeys.issuesList(),
   });

   // Invalidate all queries at all levels
   queryClient.invalidateQueries({
     queryKey: queryKeys.issues(),
   });

   // Invalidate specific issue
   queryClient.removeQueries({
     queryKey: queryKeys.issue(id),
   });
   ```

### Error Handler Utility

The `handleQueryError()` function converts API errors to user-friendly messages:

```typescript
import { handleQueryError } from '@/lib/query';

// In mutation callbacks
const { mutate } = useMutation({
  mutationFn: updateIssue,
  onError: (error) => {
    const message = handleQueryError(error);
    toast.error(message); // Shows appropriate message based on error type
  },
});
```

Error message mapping:
- **403 Forbidden**: "You do not have permission to perform this action"
- **404 Not Found**: "The requested resource was not found"
- **401 Unauthorized**: "Your session has expired. Please log in again"
- **422 Validation Error**: "The request contains invalid data"
- **5xx Server Error**: "The server encountered an error. Please try again later"
- **Other/Unknown**: "An unexpected error occurred"

### QueryProvider Component (`provider.tsx`)

The `QueryProvider` is a client component that wraps the entire app with React Query:

```typescript
'use client';

import { QueryProvider } from '@/lib/query';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

**Features:**
- Wraps app with `QueryClientProvider`
- Includes React Query DevTools (development only)
- DevTools positioned bottom-right, initially closed
- Controlled by `config.features.enableDevTools` flag

## Usage Guide

### Basic Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { getIssue } from '@/lib/api';
import { queryKeys } from '@/lib/query';

function IssueDetail({ id }: { id: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.issue(id),
    queryFn: () => getIssue(id),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{data?.data.title}</div>;
}
```

### Query with Parameters

```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query';

function IssuesList({ status }: { status: string }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.issuesList({ status }),
    queryFn: () => getIssues({ status }),
  });

  return (
    <ul>
      {data?.data.map((issue) => (
        <li key={issue.id}>{issue.title}</li>
      ))}
    </ul>
  );
}

// When status changes, React Query automatically:
// 1. Creates a new cache entry for this specific status
// 2. Fetches fresh data
// 3. Keeps previous status's data in cache for 10 minutes
```

### Mutation with Cache Invalidation

```typescript
import { useMutation } from '@tanstack/react-query';
import { createIssue } from '@/lib/api';
import { queryClient, queryKeys } from '@/lib/query';

function CreateIssueForm() {
  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateIssueDTO) => createIssue(data),
    onSuccess: (newIssue) => {
      // Invalidate all issue list queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.issuesList(),
      });
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutate(formData);
    }}>
      {/* form fields */}
    </form>
  );
}
```

### Mutation with Optimistic Updates

```typescript
function UpdateIssueForm({ issue }: { issue: Issue }) {
  const { mutate } = useMutation({
    mutationFn: (updates: UpdateIssueDTO) => updateIssue(issue.id, updates),
    onMutate: async (updates) => {
      // Cancel any pending queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.issue(issue.id),
      });

      // Save previous data
      const previousData = queryClient.getQueryData(
        queryKeys.issue(issue.id)
      );

      // Optimistically update cache
      queryClient.setQueryData(queryKeys.issue(issue.id), {
        data: { ...issue, ...updates },
      });

      return { previousData };
    },
    onError: (error, updates, context) => {
      // Revert on error
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.issue(issue.id),
          context.previousData
        );
      }
    },
    onSuccess: () => {
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.issue(issue.id),
      });
    },
  });

  return (
    <form>
      {/* Your form fields update optimistically */}
    </form>
  );
}
```

### Dependent Queries

```typescript
function UserIssues({ userId }: { userId?: string }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId!),
    enabled: !!userId, // Don't fetch until userId exists
  });

  // Only fetch issues after we have the user
  const { data: issues } = useQuery({
    queryKey: queryKeys.myIssues(),
    queryFn: () => getMyIssues(),
    enabled: !!user, // Don't fetch until user query succeeds
  });

  return (
    <div>
      {user && <h1>{user.name}'s Issues</h1>}
      {issues?.data.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
```

### Parallel Queries

```typescript
function Dashboard() {
  // All three queries run in parallel
  const issuesQuery = useQuery({
    queryKey: queryKeys.issuesList(),
    queryFn: () => getIssues(),
  });

  const channelsQuery = useQuery({
    queryKey: queryKeys.channels(),
    queryFn: () => getChannels(),
  });

  const repositoriesQuery = useQuery({
    queryKey: queryKeys.repositoryList(),
    queryFn: () => getRepositories(),
  });

  // Show loading until all queries complete
  const isLoading =
    issuesQuery.isLoading ||
    channelsQuery.isLoading ||
    repositoriesQuery.isLoading;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {/* Display data from all three queries */}
    </div>
  );
}
```

### Infinite Queries

```typescript
function IssuesWithLoadMore() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: queryKeys.issuesInfinite(),
      queryFn: ({ pageParam = 1 }) =>
        getIssues({ page: pageParam as number }),
      getNextPageParam: (lastPage) => {
        const { pagination } = lastPage;
        return pagination.page < pagination.totalPages
          ? pagination.page + 1
          : undefined;
      },
      initialPageParam: 1,
    });

  const allIssues = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div>
      {allIssues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          Load More
        </button>
      )}
    </div>
  );
}
```

## Cache Management

### Viewing Cache (Development Only)

The React Query DevTools panel (bottom-right in dev) allows you to:
- View all cached queries
- Inspect query data and metadata
- Manually invalidate queries
- See staleness and refetch history

### Manual Cache Updates

```typescript
// Set specific query data
queryClient.setQueryData(queryKeys.issue('123'), {
  data: { id: '123', title: 'Updated Title' },
});

// Add data to cache
queryClient.setQueriesData(
  { queryKey: queryKeys.issuesList() },
  (oldData) => ({
    ...oldData,
    data: [newIssue, ...oldData.data],
  })
);

// Remove query from cache
queryClient.removeQueries({
  queryKey: queryKeys.issue('123'),
});

// Clear entire cache
queryClient.clear();
```

### Prefetching

```typescript
// Prefetch data before user needs it
async function prefetchIssue(id: string) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.issue(id),
    queryFn: () => getIssue(id),
  });
}

// Example: Prefetch on hover
<Link
  href={`/issues/${issue.id}`}
  onMouseEnter={() => prefetchIssue(issue.id)}
>
  {issue.title}
</Link>
```

## Configuration

React Query behavior is controlled via environment variables and the config module:

```typescript
import { config } from '@/lib/config';

// Features can be toggled
if (config.features.enableDevTools) {
  // React Query DevTools will be visible
}
```

Update `.env.local`:
```bash
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
```

## Performance Tips

1. **Use appropriate stale times**: Don't fetch fresh data more often than needed
   ```typescript
   useQuery({
     queryKey: ['user-profile'],
     queryFn: fetchUserProfile,
     staleTime: 30 * 60 * 1000, // User profile rarely changes
   });
   ```

2. **Normalize query keys**: Include only essential params to avoid duplicate cache entries
   ```typescript
   // Good: Specific params
   queryKeys.issuesList({ status: 'open' })

   // Bad: Too specific, creates new cache for each sort order
   queryKeys.issuesList({ status: 'open', sortBy: 'date', sortOrder: 'asc' })
   ```

3. **Use enabled flag** to prevent unnecessary queries
   ```typescript
   useQuery({
     queryKey: queryKeys.myIssues(),
     queryFn: getMyIssues,
     enabled: !!userId, // Don't fetch if no user
   });
   ```

4. **Leverage mutation side effects** instead of manual cache updates
   ```typescript
   // Good: Lean on onSuccess/onError callbacks
   useMutation({
     mutationFn: createIssue,
     onSuccess: () => queryClient.invalidateQueries(),
   });

   // Avoid: Manual cache management in components
   ```

## Troubleshooting

### Query data not updating after mutation

**Problem:** Mutate succeeds but UI doesn't update.

**Solutions:**
1. Invalidate related queries
   ```typescript
   onSuccess: () => queryClient.invalidateQueries({
     queryKey: queryKeys.issuesList(),
   })
   ```
2. Or manually update cache
   ```typescript
   onSuccess: (newData) => queryClient.setQueryData(
     queryKeys.issue(id),
     newData
   )
   ```

### Queries running too frequently

**Problem:** Queries refetch constantly.

**Solutions:**
1. Increase stale time
   ```typescript
   staleTime: 5 * 60 * 1000 // 5 minutes instead of default
   ```
2. Disable refetch triggers
   ```typescript
   useQuery({
     queryFn: fetchData,
     refetchOnWindowFocus: false,
     refetchOnReconnect: false,
   })
   ```

## Related Documentation

- [API Client Module](../api/README.md) - Endpoint functions
- [Hooks Module](../hooks/README.md) - Pre-built React Query hooks
- [Type Definitions](../../types/api.ts) - Complete API types
- [React Query Docs](https://tanstack.com/query/latest) - Official documentation
