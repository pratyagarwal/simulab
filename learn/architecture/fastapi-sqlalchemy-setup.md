# FastAPI + SQLAlchemy + Alembic Architecture

## The Challenge

How do you use async SQLAlchemy in a FastAPI app while keeping Alembic migrations simple and sync?

The naive approach doesn't work:

```python
# ❌ This causes: MissingGreenlet error
engine = create_async_engine("postgresql+asyncpg://...")
alembic upgrade head  # Tries to use async driver, but Alembic is sync!
```

## The Solution: Two-Engine Architecture

Use **different drivers** for different purposes:

```
Application Layer (FastAPI)
    ↓
AsyncSession ← async_engine ← postgresql+asyncpg:// ← asyncpg
                                        ↑
                                        │
                                 DATABASE_URL env var
                                        │
                                        ↓
Migration Layer (Alembic)       postgresql+psycopg2:// ← psycopg2
    ↓
Engine ← create_engine
```

## Implementation

### Step 1: Database URL Configuration

**backend/.env**:
```env
# Use async URL for the application
DATABASE_URL=postgresql+asyncpg://simulab:simulab@localhost:5432/simulab
```

### Step 2: Application Engine Setup

**backend/core/database.py**:
```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from core.config import settings

# Async engine for FastAPI application
async_engine = create_async_engine(
    settings.DATABASE_URL,  # postgresql+asyncpg://...
    echo=settings.is_development,
    future=True,
)

# Async session factory
async_session_maker = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db() -> AsyncSession:
    """Dependency for FastAPI routes"""
    async with async_session_maker() as session:
        yield session
```

### Step 3: Alembic Configuration

**backend/alembic/env.py**:
```python
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from alembic import context

load_dotenv()

config = context.config

def get_sync_database_url() -> str:
    """Convert async URL to sync for Alembic migrations"""
    url = os.getenv("DATABASE_URL")
    # Replace asyncpg with psycopg2 for sync operations
    if "postgresql+asyncpg://" in url:
        url = url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
    return url

# Set Alembic to use sync driver
config.set_main_option("sqlalchemy.url", get_sync_database_url())

def run_migrations_offline() -> None:
    """Offline migrations (generates SQL)"""
    url = get_sync_database_url()
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Online migrations (executes against DB)"""
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_sync_database_url()

    connectable = create_engine(
        configuration["sqlalchemy.url"],
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
```

### Step 4: FastAPI Integration

**backend/main.py**:
```python
from fastapi import FastAPI, Depends
from core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI()

@app.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    # Use async database operations
    users = await db.execute(select(User))
    return users.scalars().all()
```

## Database Workflow

### Running Migrations

```bash
# Uses psycopg2 (sync driver) from Alembic
alembic upgrade head

# Creates tables in PostgreSQL
# Never conflicts with async code
```

### Using in Application

```python
# FastAPI uses asyncpg (async driver)
@app.get("/data")
async def get_data(db: AsyncSession = Depends(get_db)):
    # Non-blocking query
    data = await db.execute(select(SomeModel))
    return data.scalars().all()

# Can handle 1000s of concurrent requests efficiently
```

## Environment Variables

**backend/.env**:
```bash
# Single source of truth
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db

# Alembic will convert to:
# postgresql+psycopg2://user:pass@localhost:5432/db
```

**backend/core/config.py**:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://..."

settings = Settings()
```

## Why This Works

### 1. Single Environment Variable
- `DATABASE_URL` is defined once in `.env`
- Used by both app and migrations
- Easy to change

### 2. Automatic Conversion
- `get_sync_database_url()` converts async → sync
- No duplication
- Consistent across offline/online migrations

### 3. No Context Mixing
- App uses async throughout (FastAPI, asyncpg, AsyncSession)
- Migrations use sync throughout (Alembic, psycopg2, create_engine)
- Never mix in same context = no greenlet errors

### 4. Same Database
- Both connect to same PostgreSQL
- Migrations create tables
- App uses those tables
- Perfect separation of concerns

## Comparison: Wrong vs Right

### ❌ Wrong Approach: Try to Use Async for Alembic

```python
# alembic/env.py
from sqlalchemy.ext.asyncio import create_async_engine

# ERROR: Alembic is sync, can't use async_engine!
connectable = create_async_engine(
    "postgresql+asyncpg://...",
)
```

Result: `MissingGreenlet: greenlet_spawn has not been called`

### ✅ Right Approach: Use Sync for Alembic

```python
# alembic/env.py
from sqlalchemy import create_engine

# Convert to sync URL
url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://")

# Use sync engine
connectable = create_engine(url, poolclass=pool.NullPool)
```

Result: Migrations work perfectly!

## Dependency Installation

**backend/requirements.txt**:
```
# For async operations (FastAPI)
asyncpg>=0.29.0

# For sync operations (Alembic)
psycopg2-binary>=2.9.9

# Database ORM
sqlalchemy[asyncio]>=2.0.0
alembic>=1.13.0

# Web framework
fastapi>=0.115.0
uvicorn>=0.30.0
```

**Why both drivers?**
- `asyncpg`: FastAPI needs it for async database operations
- `psycopg2-binary`: Alembic needs it for sync migrations

## Testing Migrations

```bash
# Create a migration
alembic revision --autogenerate -m "Add new table"

# Test upgrade
alembic upgrade head

# Test downgrade
alembic downgrade -1

# Check current state
alembic current
alembic history
```

All use the sync driver (psycopg2) automatically!

## Summary

| Layer | Driver | Type | Purpose |
|-------|--------|------|---------|
| **FastAPI Application** | asyncpg | Async | Handle concurrent requests |
| **Database** | PostgreSQL | Same | Single source of truth |
| **Alembic Migrations** | psycopg2 | Sync | Manage schema changes |

**Key Insight**: Don't try to make everything async. Use the right tool for each job:
- Async for high-concurrency (API servers)
- Sync for one-time operations (migrations)
- Both can work with same database!

See also:
- [Async vs Sync](../concepts/async-vs-sync.md)
- [Database Drivers](../concepts/database-drivers.md)
- [Greenlets](../concepts/greenlets.md)
