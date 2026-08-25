# SimuLab Architecture

## High-Level Design

SimuLab is a high-fidelity training and evaluation environment for software engineering AI agents. It separates the **environment** from the **agent** to enable reproducible benchmarking across multiple models.

```
                    TaskSpec
                       │
                       ▼
              Environment Manager
                       │
                       ▼
             Isolated Environment
          ┌────────────────────────┐
          │ PostgreSQL             │
          │ Chat / Issues          │
          │ Git Repository         │
          │ CI / Tests             │
          │ MCP Server             │
          └────────────┬───────────┘
                       │
                  MCP / Shell
                       │
                       ▼
                    Agent
                       │
                       ▼
               Rollout Recorder
                       │
                       ▼
                   Evaluator
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
          Task Score       Failure Analysis
```

## Core Components

### Environment
The simulated software company containing:
- **Chat System**: Lightweight Slack-like messaging
- **Issue Tracker**: Lightweight Jira-like issue management
- **Repository**: Real Git repository with code
- **CI/Tests**: Pytest and command execution
- **MCP Server**: Tool interface for agents

### Agent
Orchestrates tool calls through:
- Model API integration
- MCP tool invocation
- Shell command execution
- Rollout recording

### Evaluator
Determines success through:
- Functional correctness tests
- State inspection
- Git diff analysis
- Deterministic evaluation

## Phase 0: Skeleton Infrastructure

Establishes foundational architecture with:

1. **Monorepo Structure**
   - `backend/` - FastAPI application
   - `frontend/` - Next.js UI
   - `agent/` - Agent orchestration
   - `docs/` - Documentation
   - `tests/` - Shared test infrastructure

2. **Backend (FastAPI + PostgreSQL)**
   - REST API for Chat and Issues
   - Database models and migrations
   - MCP server implementation
   - Health checks and logging

3. **Frontend (Next.js + TypeScript)**
   - UI for Chat, Issues, Repository
   - API client integration
   - Real-time updates

4. **Infrastructure (Docker Compose)**
   - PostgreSQL database
   - FastAPI backend service
   - Next.js frontend service
   - Networking and persistence

## Workflow Fidelity vs Visual Fidelity

SimuLab prioritizes **workflow fidelity** - reproducing the patterns and information boundaries of real engineering work - over pixel-perfect UI clones.

An agent encounters realistic workflows:
1. Receive incomplete problem description
2. Search for context in conversations and issues
3. Investigate code and Git history
4. Reproduce issues and run tests
5. Implement fixes
6. Verify correctness
7. Update tracking systems
8. Communicate with team

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Environment vs Agent | Separated | Different agents can run against identical environments |
| Evaluation | Deterministic state-based | Ground truth exists in the environment |
| Agent Loop | Custom Python | Direct control over tool execution and recording |
| MCP | Official SDK | Standard, commodity infrastructure |
| Database | PostgreSQL | Relational, proven, searchable |
| Frontend | React/Next.js | Natural fit for dynamic UI needs |

## Data Model

### Core Entities

**Users & Teams**
- Employees in the simulated company
- Organized into teams
- Track history and relationships

**Chat**
- Channels for team communication
- Messages and threads
- Full-text searchable

**Issues**
- Tracked by identifier (e.g., ENG-142)
- Status, assignee, comments
- Linked to relevant information

**Repository**
- Real Git repository
- Code, commits, history
- Tests and CI output

**Tasks**
- Well-defined engineering problems
- Multiple difficulty variants
- Deterministic seeding for reproducibility

## Evaluation Framework

### Success Criteria (Deterministic)
- Bug reproduced initially
- Correct fix implemented
- Existing tests pass
- No unrelated changes
- Issue updated
- Team notified

### Failure Classification
- **MODEL_FAILURE**: Agent made wrong decisions
- **TASK_FAILURE**: Problem statement invalid
- **ENVIRONMENT_FAILURE**: Infrastructure issue
- **UNKNOWN**: Unable to determine cause

## Future Extensions

- Browser/computer-use agent support
- Multiple model provider comparison
- Larger synthetic organizations
- Automatic task mutation
- Semantic search capabilities
- Human-vs-agent baselines
- Multi-repository tasks
- CI/CD workflow integration
