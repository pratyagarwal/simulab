# Types

TypeScript type definitions for SimuLab UI.

## Structure

```
types/
├── index.ts           # Central export point for all types
├── api.ts             # API request/response types
├── entities.ts        # Domain entity types
│   ├── User
│   ├── Team
│   ├── Channel
│   ├── Message
│   ├── Issue
│   └── Comment
├── components.ts      # Component prop types
├── hooks.ts           # Hook return types
└── store.ts           # State/store types (if using state management)
```

## Guidelines

- Keep types close to where they're used
- Export all types from `index.ts` for convenient importing
- Use `interface` for object shapes, `type` for unions/tuples
- Document complex types with JSDoc comments
- Avoid `any` - use `unknown` with type guards when necessary

## Example Usage

```typescript
// In types/index.ts
export * from './entities'
export * from './api'
export * from './components'

// In components
import type { Message, User } from '@/types'
```

## Naming Conventions

- Entity types: PascalCase (e.g., `Message`, `Issue`)
- Request/Response types: Suffix with `Request`, `Response` (e.g., `UpdateIssueRequest`)
- API types: Prefix with API context (e.g., `ChatAPIResponse`)
