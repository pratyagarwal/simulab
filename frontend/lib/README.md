# Lib

Shared utilities, helpers, and constants for SimuLab UI.

## Structure

```
lib/
├── api.ts             # API client and request utilities
├── constants.ts       # Application constants
├── hooks/             # Custom React hooks
│   ├── useAuth.ts
│   ├── useChat.ts
│   └── useIssues.ts
├── utils/             # General utility functions
│   ├── format.ts      # Formatting utilities (dates, strings, etc.)
│   ├── validation.ts  # Form validation helpers
│   └── api-utils.ts   # API-specific utilities
└── store/             # State management (if using zustand/recoil)
    └── index.ts
```

## Guidelines

- **api.ts** - Centralized API client setup and endpoints
- **constants.ts** - All magic strings, numbers, enums
- **hooks/** - Reusable custom hooks for business logic
- **utils/** - Pure utility functions with no side effects
- **store/** - State management setup (optional)

## Best Practices

- Keep functions pure and testable
- Avoid side effects in utility functions
- Export types alongside implementations
- Document complex logic with comments
