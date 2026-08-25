# SimuLab

A high-fidelity training and evaluation environment for software engineering AI agents.

## Overview

SimuLab is a reproducible miniature software company where AI agents perform realistic, multi-step engineering tasks across communication, project management, code, Git, tests, and CI/CD.

### Core Concept

Rather than pixel-perfect clones of Slack, Jira, or GitHub, SimuLab reproduces **workflow fidelity**: the patterns, information boundaries, state transitions, and consequences of professional engineering work.

An AI agent encounters realistic workflows:

1. Receive an incomplete bug report
2. Search company conversations
3. Inspect engineering issues
4. Examine Git history
5. Reproduce the problem
6. Modify code
7. Run tests
8. Verify the fix
9. Update the issue
10. Notify the team

### Key Features

- **Integrated Environment**: Chat system, issue tracking, real Git repository, terminal/CI
- **Persistent State**: Actions modify environment; changes are observable and measurable
- **Deterministic Evaluation**: Independent evaluator determines task success based on state, not agent claims
- **Reproducible Tasks**: Environments can be reset and recreated exactly for multiple agent runs
- **Task Calibration**: Multiple difficulty variants of the same scenario
- **Comprehensive Rollout Recording**: Tool calls, shell commands, file changes, timestamps, and evaluation results

## Project Structure

```
simulab/
├── backend/          # FastAPI application
├── frontend/         # React/Next.js UI
├── agent/           # Agent orchestration and MCP tools
├── docs/            # Documentation
└── tests/           # Shared test infrastructure
```

## Technology Stack

- **Backend**: Python, FastAPI, Pydantic, PostgreSQL
- **Frontend**: TypeScript, React, Next.js
- **Agent**: Official MCP SDK, direct model provider APIs
- **Infrastructure**: Docker Compose

## Development Status

Early stage - starting Phase 0 (skeleton infrastructure)

## License

To be determined
