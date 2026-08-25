# SimuLab Backend

FastAPI-based backend for SimuLab - Engineering Agent Evaluation Environment.

## Overview

This backend provides REST APIs and real-time WebSocket communication for the SimuLab frontend. It manages:

- **Issues/Tickets**: Issue tracking and management
- **Chat**: Real-time messaging with channels and threads
- **Repositories**: Git repository integration and commit tracking
- **Users & Teams**: User and team management with roles

## Technology Stack

- **Framework**: FastAPI 0.115+
- **Database**: PostgreSQL 15+ with SQLAlchemy 2.0 (async)
- **Validation**: Pydantic v2
- **Migrations**: Alembic
- **Real-time**: WebSocket + Redis pub/sub
- **Authentication**: JWT tokens
- **Testing**: pytest + pytest-asyncio
- **Dev Tools**: black, ruff, mypy

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis (for WebSocket support)

### Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start development server
uvicorn main:app --reload
```

### Environment Variables

See `.env.example` for all configuration options.

## Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── config.py               # Settings and configuration
├── models/                 # SQLAlchemy database models
├── schemas/                # Pydantic request/response schemas
├── api/                    # API route handlers
├── services/               # Business logic
├── core/                   # Core infrastructure
├── websocket/              # WebSocket support
├── utils/                  # Utility functions
├── tests/                  # Test suite
├── alembic/                # Database migrations
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── requirements.txt
└── .env.example
```

## Integration with Frontend

The backend APIs are designed to match the frontend TypeScript types exactly. See:

- Frontend API client: `frontend/lib/api/`
- Frontend type definitions: `frontend/types/api.ts`
- Frontend hooks: `frontend/lib/hooks/`

All response formats and field names must match frontend expectations.

## License

MIT
