# Database Drivers: asyncpg vs psycopg2

## What is a Database Driver?

A **driver** is software that translates between your programming language and a specific database.

### Analogy: Language Translator

```
You (Python) ↔️ Translator (Driver) ↔️ PostgreSQL Database
   speaks         understands         speaks
   Python         both                PostgreSQL
```

Without a driver, Python and PostgreSQL can't communicate!

## Two Types of Drivers

### Sync Driver: psycopg2

```python
import psycopg2

# Connect to database (BLOCKS/WAITS)
conn = psycopg2.connect("postgresql://localhost/mydb")
cursor = conn.cursor()

# Execute query (BLOCKS/WAITS for result)
cursor.execute("SELECT * FROM users")
results = cursor.fetchall()  # Waits until data arrives
print(results)
```

**Characteristics**:
- Synchronous (blocks while waiting)
- Traditional connection style
- Simple and proven
- Used for scripts, migrations, batch jobs

### Async Driver: asyncpg

```python
import asyncpg

# Connect to database (DOESN'T BLOCK)
conn = await asyncpg.connect("postgresql://localhost/mydb")

# Execute query (DOESN'T BLOCK - do other things while waiting)
results = await conn.fetch("SELECT * FROM users")
print(results)
```

**Characteristics**:
- Asynchronous (doesn't block)
- Modern approach
- Better for high-concurrency
- Used for web servers, APIs

## The Difference in Practice

### Sync (psycopg2) - Blocking

```
Time: 0s    5s      10s     15s
     │  │   │       │       │
A    ├──┤ Query... (blocked for 5s)
B    │  └──┤ Waits... (blocked until A done)
C    │     └──┤ Waits... (blocked until B done)

Total: 15 seconds (nobody can do anything while waiting)
```

### Async (asyncpg) - Non-blocking

```
Time: 0s      5s
     │       │
A    ├─Query...
B    ├─Query...
C    ├─Query...
     └─All ready

Total: ~5 seconds (all running in parallel!)
```

## PostgreSQL + Sync Driver (psycopg2)

```python
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

# Create sync engine - uses psycopg2 by default
engine = create_engine("postgresql://localhost/mydb")

# Traditional session
with Session(engine) as session:
    users = session.execute(select(User)).scalars()
    print(users)  # Blocks while fetching
```

**URL format**: `postgresql://user:pass@localhost/dbname`
- Simple and common
- Defaults to psycopg2 if installed

## PostgreSQL + Async Driver (asyncpg)

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import select

# Create async engine - uses asyncpg
engine = create_async_engine("postgresql+asyncpg://localhost/mydb")

# Async session
async with AsyncSession(engine) as session:
    users = await session.execute(select(User))
    users = users.scalars()
    print(users)  # Doesn't block
```

**URL format**: `postgresql+asyncpg://user:pass@localhost/dbname`
- Explicitly specifies asyncpg driver
- Requires `async`/`await` syntax

## Explicit Driver Specification

### Default (Auto-detect)
```python
# Uses psycopg2 by default (if installed)
"postgresql://localhost/mydb"
```

### Explicit Sync
```python
# Explicitly use psycopg2
"postgresql+psycopg2://localhost/mydb"
```

### Explicit Async
```python
# Explicitly use asyncpg
"postgresql+asyncpg://localhost/mydb"
```

## Choosing the Right Driver

### Use psycopg2 When:
- Running database migrations (Alembic)
- Scripts that run once
- Simple, linear database operations
- No need for concurrency

### Use asyncpg When:
- Building web APIs (FastAPI, Django Async)
- Handling many concurrent connections
- Real-time features (WebSockets)
- High-performance requirements

## Can You Use Both?

**YES! This is the recommended approach!**

```python
# Application (FastAPI) - uses asyncpg
from sqlalchemy.ext.asyncio import create_async_engine

async_engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost/db"
)

# Migrations (Alembic) - uses psycopg2
# In alembic/env.py:
sync_url = "postgresql+psycopg2://user:pass@localhost/db"
engine = create_engine(sync_url)
```

**Benefits**:
- App is fast and efficient (async)
- Migrations are simple and reliable (sync)
- Both connect to same database
- No conflicts or interference

## The SimuLab Setup

Our current architecture:

```
┌─────────────────────────────┐
│  FastAPI Application        │
│  (Future API endpoints)     │
│                             │
│  asyncpg driver             │
│  postgresql+asyncpg://...  │
└──────────────┬──────────────┘
               │
               ↓
        PostgreSQL Database
               ↑
               │
┌──────────────┴──────────────┐
│  Alembic Migrations         │
│  (Create/modify tables)     │
│                             │
│  psycopg2 driver            │
│  postgresql+psycopg2://...  │
└─────────────────────────────┘
```

**Why both?**
1. **asyncpg for app**: Handles thousands of concurrent requests efficiently
2. **psycopg2 for migrations**: Simple, synchronous, no complications

## Common Issues

### Issue: Missing Driver Error
```
sqlalchemy.exc.NoSuchModuleError: Can't load plugin:
sqlalchemy.dialects:postgresql
```

**Cause**: No PostgreSQL driver installed
**Fix**: `pip install psycopg2-binary` or `pip install asyncpg`

### Issue: greenlet_spawn Error
```
sqlalchemy.exc.MissingGreenlet: greenlet_spawn has not been called
```

**Cause**: Using async SQLAlchemy in sync context (or vice versa)
**Fix**: Use appropriate driver for context (see Greenlets)

### Issue: Wrong URL Format
```python
# WRONG - asyncpg driver, but sync code trying to use it
engine = create_engine("postgresql+asyncpg://localhost/db")

# RIGHT - sync code needs psycopg2
engine = create_engine("postgresql+psycopg2://localhost/db")
```

## Summary

| Feature | psycopg2 | asyncpg |
|---------|----------|---------|
| **Type** | Sync | Async |
| **Blocking** | Yes | No |
| **Use Case** | Scripts, Migrations | APIs, Web servers |
| **Connection URL** | `postgresql://` or `postgresql+psycopg2://` | `postgresql+asyncpg://` |
| **Performance (1 query)** | Decent | Same |
| **Performance (100 concurrent)** | Bad | Excellent |
| **Complexity** | Simple | Medium |

See also: [Async vs Sync](./async-vs-sync.md), [Greenlets](./greenlets.md)
