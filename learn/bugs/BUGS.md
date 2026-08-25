# Bugs Encountered & Solutions

Quick reference of all bugs/errors encountered during SimuLab development.

## 1. ModuleNotFoundError: No module named 'asyncpg'

**Error**: `ModuleNotFoundError: No module named 'asyncpg'` when running Alembic migrations.

**Explanation**:
The `requirements.txt` file lists all Python packages needed for the project, including `asyncpg>=0.29.0` which is an async PostgreSQL driver. When you run the project without installing these dependencies first, Python can't find the module because it's not installed in your Python environment yet.

**Example**:
```bash
# This fails because asyncpg isn't installed
$ alembic upgrade head
ModuleNotFoundError: No module named 'asyncpg'

# The requirements.txt file has this line:
# asyncpg>=0.29.0
```

**Solution**: Installed missing dependencies with `python3 -m pip install -r requirements.txt` which installed asyncpg along with all other required packages.

---

## 2. MissingGreenlet: greenlet_spawn has not been called

**Error**: `sqlalchemy.exc.MissingGreenlet: greenlet_spawn has not been called` when running `alembic upgrade head`.

**Explanation**:
This is a fundamental mismatch between async and sync code. The backend app uses `asyncpg` (async driver) which requires SQLAlchemy to track async context using greenlets. However, Alembic is synchronous - it doesn't provide the greenlet context that SQLAlchemy expects. When Alembic tries to use the async-configured database URL, SQLAlchemy looks for greenlet tracking that doesn't exist in the sync environment.

**Example**:
```python
# In core/database.py - configured for ASYNC
DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/db"
async_engine = create_async_engine(DATABASE_URL)
# This requires greenlets

# In alembic/env.py - SYNC execution
# SQLAlchemy tries to use asyncpg URL in sync context
# ERROR: greenlet_spawn has not been called
```

**Solution**: Added missing `psycopg2-binary` to requirements.txt and modified `alembic/env.py` to convert async database URL (`postgresql+asyncpg://`) to sync URL (`postgresql+psycopg2://`) using `get_sync_database_url()` helper function. This implements the two-driver architecture (asyncpg for app, psycopg2 for migrations).

---

## 3. DuplicateObject: type "userrole" already exists

**Error**: `psycopg2.errors.DuplicateObject: type "userrole" already exists` when running migrations.

**Explanation**:
PostgreSQL enums are special types that must be created before use. The migration file was trying to create the `userrole` enum type twice: once explicitly with `op.execute()` and again implicitly when SQLAlchemy created the table column that uses `sa.Enum()`. SQLAlchemy is smart enough to create enums automatically, so the manual creation causes a duplicate type error.

**Example**:
```python
# BAD - trying to create enum twice
op.execute("CREATE TYPE userrole AS ENUM ('admin', 'user', 'agent')")  # First create
op.create_table(
    'users',
    sa.Column('role', sa.Enum('admin', 'user', 'agent', name='userrole'), ...)
    # SQLAlchemy tries to create it again - ERROR!
)

# GOOD - let SQLAlchemy handle it
op.create_table(
    'users',
    sa.Column('role', sa.Enum('admin', 'user', 'agent', name='userrole'), ...)
    # SQLAlchemy creates the enum automatically
)
```

**Solution**: Removed redundant `.create()` calls on enum types in the migration file (lines 21-23). SQLAlchemy automatically creates enum types when defining columns with `sa.Enum()`, so explicit creation was causing duplicates. Fixed by removing manual enum creation and letting SQLAlchemy handle it.

---

## 4. Input device is not a TTY

**Error**: `the input device is not a TTY` when running `docker exec -it simulab-postgres psql`.

**Explanation**:
The `-it` flags in Docker tell it to run interactively with a TTY (terminal). However, when you run a command from a script, CI/CD pipeline, or background process, there is no actual terminal attached. The `-i` flag (interactive) expects stdin input, and `-t` flag expects a terminal to attach to. When neither exists, Docker can't fulfill this request.

**Example**:
```bash
# This works in your terminal (interactive mode)
$ docker exec -it simulab-postgres psql -U simulab -d simulab -c "SELECT * FROM users;"
# Works because your terminal provides a TTY

# This fails in a script or background process
$ docker exec -it simulab-postgres psql ...
# ERROR: the input device is not a TTY
# No terminal available, but -it flags require one

# This works everywhere (non-interactive)
$ docker exec simulab-postgres psql -U simulab -d simulab -c "SELECT * FROM users;"
# Works because no TTY is requested
```

**Solution**: Removed `-it` flags from docker exec command. Use `docker exec simulab-postgres psql` instead of `docker exec -it simulab-postgres psql` when running non-interactively.

---

## 5. HTTPAuthCredentials import not found

**Error**: `ImportError: cannot import name 'HTTPAuthCredentials'` when importing from `fastapi.security`.

**Explanation**:
`HTTPAuthCredentials` is a class that was supposed to represent HTTP authentication credentials in older FastAPI versions. However, in modern FastAPI (0.140+), this class doesn't exist or isn't exported. When FastAPI's `HTTPBearer()` security scheme extracts credentials from the Authorization header, it actually returns a plain dictionary with a `credentials` field, not an `HTTPAuthCredentials` object.

**Example**:
```python
# OLD CODE - doesn't work in modern FastAPI
from fastapi.security import HTTPBearer, HTTPAuthCredentials  # Class doesn't exist!

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)):
    # HTTPAuthCredentials class not found - ImportError
    token = credentials.credentials
```

```python
# FIXED CODE - works with modern FastAPI
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(credentials: dict = Depends(security)):
    # Use dict type instead
    token = credentials.get('credentials')  # or credentials['credentials']
```

**Solution**: Changed parameter type from `HTTPAuthCredentials` to `dict` in `core/dependencies.py`. The class doesn't exist in current FastAPI versions - httpx returns a plain dict with `credentials` field instead.

---

## 6. CORS_ORIGINS parsing error

**Error**: `SettingsError: error parsing value for field "CORS_ORIGINS"` when loading .env file.

**Explanation**:
Pydantic v2 (newer version) changed how it handles environment variables. When you define a field as `List[str]`, Pydantic v2 expects the environment variable to be valid JSON (like `["url1", "url2"]`). However, in `.env` files, we typically write comma-separated values like `http://localhost:3000,http://localhost:8000`. Pydantic tries to JSON-parse this plain string as a list, which fails because it's not valid JSON.

**Example**:
```python
# In core/config.py - WRONG for Pydantic v2
from typing import List

class Settings(BaseSettings):
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]  # Pydantic expects JSON!

# In .env file
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
# ERROR: Pydantic tries to parse this as JSON
# It's not valid JSON, so it fails!

# CORRECT - use str and parse manually
class Settings(BaseSettings):
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000"  # Plain string

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
```

**Solution**: Changed `CORS_ORIGINS` from `List[str]` to `str` in `core/config.py`, then added `cors_origins_list` property to parse comma-separated values manually. Pydantic v2 tries to JSON-parse list-type env vars instead of reading them as strings.

---

## 7. Bcrypt version incompatibility with passlib 1.7.4

**Error**: `AttributeError: module 'bcrypt' has no attribute '__about__'` when calling `hash_password()`.

**Explanation**:
`passlib` is a password hashing library that wraps other hashing algorithms (bcrypt, argon2, scrypt). However, passlib 1.7.4 was released in 2016, and bcrypt 5.0.0 was released in 2023. The old passlib version tries to access metadata from bcrypt (like `bcrypt.__about__`) that no longer exists in modern bcrypt versions. The internal APIs changed too much between versions for old passlib to work.

**Example**:
```python
# requirements.txt
passlib[bcrypt]==1.7.4  # Old version from 2016
bcrypt>=5.0.0  # New version from 2023

# In core/security.py
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"])

def hash_password(password: str):
    # passlib 1.7.4 tries: bcrypt.__about__
    # But bcrypt 5.0.0 doesn't have __about__ attribute
    return pwd_context.hash(password)  # ERROR!

# Version incompatibility:
# Old passlib (2016) ↔️ New bcrypt (2023) = broken
```

**Solution**: Removed `passlib[bcrypt]` dependency entirely and switched to `argon2-cffi` directly. passlib 1.7.4 (2016) is too old for bcrypt 5.0.0 (2023) - their internals are incompatible. Updated `core/security.py` to import `PasswordHasher` from argon2 directly.

---

## 8. Argon2 backend not available in passlib

**Error**: `passlib.exc.MissingBackendError: argon2: no backends available -- recommend you install one (e.g. 'pip install argon2_cffi')` when using passlib with argon2.

**Explanation**:
Even though `argon2-cffi` is installed, passlib can't find it. This is because passlib uses its own internal mechanism to discover and load backend libraries. It scans for installed packages and tries to import them, but something in this discovery process fails (version incompatibility, missing metadata, etc.). The recommendation to "pip install argon2_cffi" won't help because it's already installed - the real issue is passlib can't load it.

**Example**:
```python
# requirements.txt
passlib[argon2]>=1.7.4  # Tells passlib to use argon2
argon2-cffi>=21.3.0     # Installs argon2, but passlib can't find it

# In core/security.py
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["argon2"])  # passlib tries to load argon2

def hash_password(password: str):
    # passlib looks for argon2 backend...
    # Can't find it, even though argon2-cffi is installed!
    # ERROR: MissingBackendError

# The problem:
# passlib's auto-discovery is broken with old passlib + modern argon2-cffi
# Solution: Don't use passlib as middleman, use argon2 directly!

# FIXED CODE
from argon2 import PasswordHasher  # Direct import, no passlib needed
hasher = PasswordHasher()
def hash_password(password: str):
    return hasher.hash(password)  # Works perfectly!
```

**Solution**: Removed passlib entirely - don't rely on passlib to load backend libraries. Use argon2-cffi's native `PasswordHasher` API directly instead: `from argon2 import PasswordHasher`.

---

## 9. UserRole enum attribute error

**Error**: `AttributeError: type object 'UserRole' has no attribute 'user'` when registering user.

**Explanation**:
In Python enums, the attribute names are case-sensitive. If you define an enum as `USER = "USER"`, you must access it as `UserRole.USER`, not `UserRole.user`. Python treats these as completely different attributes. Trying to access `.user` (lowercase) when only `.USER` (uppercase) exists will raise an AttributeError.

**Example**:
```python
# In models/user.py
from enum import Enum

class UserRole(str, Enum):
    USER = "USER"      # Define as uppercase
    ADMIN = "ADMIN"
    AGENT = "AGENT"

# In routers/auth.py
def register(request):
    # WRONG - attribute .user doesn't exist
    new_user = User(role=UserRole.user)  # AttributeError!

    # CORRECT - must use .USER (uppercase)
    new_user = User(role=UserRole.USER)  # Works!

# Python enum attributes are case-sensitive:
UserRole.USER   # ✓ Works
UserRole.user   # ✗ AttributeError: 'user' not found
```

**Solution**: Changed `UserRole.user` to `UserRole.USER` in `routers/auth.py`. The enum definition uses uppercase: `USER = "USER"` not lowercase.

---

## 10. Database enum value mismatch

**Error**: `sqlalchemy.dialects.postgresql.asyncpg.Error: invalid input value for enum userrole: "USER"` when inserting user into database.

**Explanation**:
PostgreSQL enum types are strict - the database only accepts values that were defined when the enum type was created. If the enum was created with lowercase values (`'admin', 'user', 'agent'`), but your Python code tries to insert uppercase (`'USER'`), PostgreSQL will reject it as invalid because those exact values don't match what's in the database type definition.

**Example**:
```sql
-- DATABASE DEFINITION (migration file had lowercase)
CREATE TYPE userrole AS ENUM ('admin', 'user', 'agent');

-- PYTHON CODE (model uses uppercase)
class UserRole(str, Enum):
    USER = "USER"  # Uppercase!

-- INSERT ATTEMPT
INSERT INTO users (role) VALUES ('USER')
-- ERROR: invalid input value for enum userrole: "USER"
-- PostgreSQL only accepts: 'admin', 'user', 'agent' (lowercase)
```

**The Fix**:
```python
# Step 1: Update migration file to use uppercase
sa.Enum('ADMIN', 'USER', 'AGENT', name='userrole')

# Step 2: Update model to match
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"
    AGENT = "AGENT"

# Step 3: Recreate tables in database
DROP TABLE users CASCADE;
DELETE FROM alembic_version;
alembic upgrade head

# Now inserts work because database and Python agree on values!
```

**Solution**: Updated migration file `alembic/versions/001_initial_schema.py` to create enum with uppercase values: `sa.Enum('ADMIN', 'USER', 'AGENT', name='userrole')` instead of lowercase. Then recreated database tables with `DROP TABLE ... CASCADE` and `alembic upgrade head`.

---

## 11. Uvicorn reload crash on file change

**Error**: `AttributeError: 'Config' object has no attribute 'ssl_context_factory'` when uvicorn auto-reloads after file edit.

**Explanation**:
Uvicorn has a "reload" mode that watches for file changes and automatically restarts the server. When a file changes, uvicorn tries to reload by recreating its Config object. However, something goes wrong in this reload process - the Config object ends up in an inconsistent state where it's missing the `ssl_context_factory` attribute that the reload code expects to find. This is often a version compatibility issue with uvicorn or its dependencies. The server is running fine, but the reload mechanism breaks.

**Example**:
```bash
# Start server with reload enabled
$ python3 main.py
INFO: Uvicorn running on http://0.0.0.0:8000
INFO: Started reloader process [12345]
INFO: Started server process [12346]
INFO: Application startup complete

# Edit a file (e.g., routers/auth.py)
# Uvicorn detects change...
WARNING: WatchFiles detected changes in 'core/security.py'. Reloading...
# Uvicorn tries to reload
AttributeError: 'Config' object has no attribute 'ssl_context_factory'
# Reload crash! Server stops.
```

**The Problem**:
```
When you edit a file:
1. Uvicorn's file watcher detects the change
2. Uvicorn kills the old server process
3. Uvicorn tries to reload and restart
4. During reload, Config object gets corrupted
5. Crash!
```

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
