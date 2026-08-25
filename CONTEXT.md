# Quick Context

## Current Branch
`pratyushagarwal4/sim-10-add-frontend-api-client`

## What's Done
- SIM-6 to SIM-9: Frontend setup (Next.js, structure, tooling)
- SIM-10 (SIM-14 to SIM-20): API client infrastructure
  - lib/api/ - APIClient, errors, endpoint functions
  - lib/query/ - React Query config and QueryProvider
  - lib/hooks/ - 9 React Query hooks for issues
  - types/api.ts - Complete type definitions
  - Documentation in each lib/ README
- SIM-21: Basic layout component (app/components/Layout.tsx)

## Key Files to Know
- `frontend/lib/api/` - All API logic
- `frontend/lib/query/client.ts` - Query key factory & handleQueryError
- `frontend/lib/hooks/useIssues.ts` - Issue hooks pattern
- `frontend/app/components/Layout.tsx` - Main layout
- `frontend/app/page.tsx` - Home page using Layout
- `frontend/.env.example` - Config template

## Open PR
PR #6: SIM-10 Full (includes SIM-14-20 + SIM-21)

## Current Status
All 8 commits stacked on branch. Ready to review/merge or continue building features.
