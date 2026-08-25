# Contributing to SimuLab

## Overview

SimuLab is a high-fidelity training and evaluation environment for software engineering AI agents. We welcome contributions that help build and improve this platform.

## Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker and Docker Compose
- Git

### Getting Started

1. **Clone the repository**
   ```bash
   git clone git@github.com:pratyagarwal/simulab.git
   cd simulab
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Start development environment**
   ```bash
   docker-compose up
   ```

## Project Structure

```
simulab/
├── backend/          # FastAPI application
├── frontend/         # React/Next.js UI
├── agent/           # Agent orchestration and MCP tools
├── docs/            # Documentation
├── tests/           # Shared test infrastructure
└── .github/         # GitHub configuration
```

## Development Workflow

### Branches

- `main` - Production-ready code
- `pratyushagarwal4/sim-{issue-number}-*` - Feature/issue branches

Use the branch name provided by Linear when working on issues.

### Commits

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(backend): add health check endpoint

- Implement GET /health endpoint
- Return service status and dependencies
- Add database connectivity check

Closes SIM-6
```

### Pull Requests

1. Create a draft PR early to get feedback
2. Link to the corresponding Linear issue
3. Include description of changes and testing approach
4. Ensure CI passes before marking as ready for review

## Phase Milestones

The project follows a phased approach:

- **Phase 0**: Skeleton infrastructure (this phase)
- **Phase 1**: Tiny environment with Chat/Issues
- **Phase 2**: Task #1 implementation
- ... and more

Each phase has defined checkpoints and deliverables.

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov
```

## Code Standards

- Python: Follow PEP 8, use Black for formatting
- TypeScript/JavaScript: Use ESLint and Prettier
- Commit messages: Use conventional commits
- Documentation: Keep README and docs updated

## Questions?

Check the project documentation or open an issue on Linear.
