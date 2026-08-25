# Components

Reusable React components for SimuLab UI.

## Structure

Components are organized by feature/domain:

```
components/
├── chat/              # Chat system components
│   ├── MessageList.tsx
│   ├── MessageInput.tsx
│   └── Thread.tsx
├── issues/            # Issue tracking components
│   ├── IssueList.tsx
│   ├── IssueDetail.tsx
│   └── IssueForm.tsx
├── common/            # Shared/reusable components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Button.tsx
│   └── Card.tsx
└── layout/            # Layout components
    ├── Navigation.tsx
    └── MainLayout.tsx
```

## Naming Conventions

- **PascalCase** for component files (e.g., `MessageList.tsx`)
- One component per file
- Keep components focused and single-responsibility
- Export default and/or named exports as needed

## Component Guidelines

- Use functional components with hooks
- Props should be typed with TypeScript interfaces
- Document complex components with JSDoc comments
- Keep styles in separate CSS modules or use Tailwind utilities
