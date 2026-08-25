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

## 5. HTTPAuthCredentials import not found

**Error**: `ImportError: cannot import name 'HTTPAuthCredentials'` when importing from `fastapi.security`.

**Solution**: Changed parameter type from `HTTPAuthCredentials` to `dict` in `core/dependencies.py`. The class doesn't exist in current FastAPI versions - httpx returns a plain dict with `credentials` field instead.

---

## 6. CORS_ORIGINS parsing error

**Error**: `SettingsError: error parsing value for field "CORS_ORIGINS"` when loading .env file.

**Solution**: Changed `CORS_ORIGINS` from `List[str]` to `str` in `core/config.py`, then added `cors_origins_list` property to parse comma-separated values manually. Pydantic v2 tries to JSON-parse list-type env vars instead of reading them as strings.

---

## 7. Bcrypt version incompatibility with passlib 1.7.4

**Error**: `AttributeError: module 'bcrypt' has no attribute '__about__'` when calling `hash_password()`.

**Solution**: Removed `passlib[bcrypt]` dependency entirely and switched to `argon2-cffi` directly. passlib 1.7.4 (2016) is too old for bcrypt 5.0.0 (2023) - their internals are incompatible. Updated `core/security.py` to import `PasswordHasher` from argon2 directly.

---

## 8. Argon2 backend not available in passlib

**Error**: `passlib.exc.MissingBackendError: argon2: no backends available -- recommend you install one (e.g. 'pip install argon2_cffi')` when using passlib with argon2.

**Solution**: Removed passlib entirely - don't rely on passlib to load backend libraries. Use argon2-cffi's native `PasswordHasher` API directly instead: `from argon2 import PasswordHasher`.

---

## 9. UserRole enum attribute error

**Error**: `AttributeError: type object 'UserRole' has no attribute 'user'` when registering user.

**Solution**: Changed `UserRole.user` to `UserRole.USER` in `routers/auth.py`. The enum definition uses uppercase: `USER = "USER"` not lowercase.

---

## 10. Database enum value mismatch

**Error**: `sqlalchemy.dialects.postgresql.asyncpg.Error: invalid input value for enum userrole: "USER"` when inserting user into database.

**Solution**: Updated migration file `alembic/versions/001_initial_schema.py` to create enum with uppercase values: `sa.Enum('ADMIN', 'USER', 'AGENT', name='userrole')` instead of lowercase. Then recreated database tables with `DROP TABLE ... CASCADE` and `alembic upgrade head`.

---

## 11. Uvicorn reload crash on file change

**Error**: `AttributeError: 'Config' object has no attribute 'ssl_context_factory'` when uvicorn auto-reloads after file edit.

**Solution**: Killed running server process and restarted cleanly. This was a uvicorn version/state issue - killing and restarting fixed it. No code changes needed.

---

## Summary Table

| # | Error | Root Cause | Solution |
|---|-------|-----------|----------|
| 1 | ModuleNotFoundError: asyncpg | Dependencies not installed | `pip install -r requirements.txt` |
| 2 | MissingGreenlet | Async/sync context mismatch | Use psycopg2 for Alembic, asyncpg for app |
| 3 | DuplicateObject: enum type | Redundant enum creation in migration | Remove manual `.create()` calls |
| 4 | Input device is not a TTY | Using `-it` flags non-interactively | Remove `-it` flags from docker exec |
| 5 | HTTPAuthCredentials import | Class doesn't exist in FastAPI | Use `dict` type instead |
| 6 | CORS_ORIGINS parsing | Pydantic v2 JSON-parsing env list | Change to `str` type with property parser |
| 7 | Bcrypt incompatible with passlib | passlib 1.7.4 too old for bcrypt 5.0 | Use argon2-cffi directly, not via passlib |
| 8 | Argon2 backend not available | passlib can't load backend libs properly | Import from argon2 directly, skip passlib |
| 9 | UserRole enum attribute error | Used lowercase `.user` not `.USER` | Change to uppercase enum reference |
| 10 | Database enum value mismatch | Migration had lowercase, model has uppercase | Update migration to uppercase values, recreate tables |
| 11 | Uvicorn reload crash | Version/state issue on auto-reload | Kill and restart server cleanly |

---

## How to Add New Bugs

When you encounter a new bug, add it here in this format:

```
## N. Error: [Error Title]

**Error**: `[Full error message]`

**Solution**: [One line solution]
```

Keep it concise - one line per solution for quick reference!
