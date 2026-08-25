# Bugs Encountered & Solutions

Quick reference of all bugs/errors encountered during SimuLab development.

## 1. ModuleNotFoundError: No module named 'asyncpg'

**Error**: `ModuleNotFoundError: No module named 'asyncpg'` when running Alembic migrations.

**Solution**: Installed missing dependencies with `python3 -m pip install -r requirements.txt` which installed asyncpg along with all other required packages.

---

## 2. MissingGreenlet: greenlet_spawn has not been called

**Error**: `sqlalchemy.exc.MissingGreenlet: greenlet_spawn has not been called` when running `alembic upgrade head`.

**Solution**: Added missing `psycopg2-binary` to requirements.txt and modified `alembic/env.py` to convert async database URL (`postgresql+asyncpg://`) to sync URL (`postgresql+psycopg2://`) using `get_sync_database_url()` helper function. This implements the two-driver architecture (asyncpg for app, psycopg2 for migrations).

---

## 3. DuplicateObject: type "userrole" already exists

**Error**: `psycopg2.errors.DuplicateObject: type "userrole" already exists` when running migrations.

**Solution**: Removed redundant `.create()` calls on enum types in the migration file (lines 21-23). SQLAlchemy automatically creates enum types when defining columns with `sa.Enum()`, so explicit creation was causing duplicates. Fixed by removing manual enum creation and letting SQLAlchemy handle it.

---

## 4. Input device is not a TTY

**Error**: `the input device is not a TTY` when running `docker exec -it simulab-postgres psql`.

**Solution**: Removed `-it` flags from docker exec command. Use `docker exec simulab-postgres psql` instead of `docker exec -it simulab-postgres psql` when running non-interactively.

---

## Summary Table

| # | Error | Root Cause | Solution |
|---|-------|-----------|----------|
| 1 | ModuleNotFoundError: asyncpg | Dependencies not installed | `pip install -r requirements.txt` |
| 2 | MissingGreenlet | Async/sync context mismatch | Use psycopg2 for Alembic, asyncpg for app |
| 3 | DuplicateObject: enum type | Redundant enum creation in migration | Remove manual `.create()` calls |
| 4 | Input device is not a TTY | Using `-it` flags non-interactively | Remove `-it` flags from docker exec |

---

## How to Add New Bugs

When you encounter a new bug, add it here in this format:

```
## N. Error: [Error Title]

**Error**: `[Full error message]`

**Solution**: [One line solution]
```

Keep it concise - one line per solution for quick reference!
