# Async vs Sync: Understanding Python Concurrency

## Quick Definition

**Sync (Synchronous)**: Do one thing at a time, wait for it to finish before moving to the next.
**Async (Asynchronous)**: Start multiple things, and handle them as they complete.

## Real World Analogy: Coffee Shop

### Sync Approach (One Barista, Waits for Each Customer)
```
Customer 1 orders → Barista makes coffee (5 min) → hands over → wait
Customer 2 orders → Barista makes coffee (5 min) → hands over → wait
Customer 3 orders → Barista makes coffee (5 min) → hands over → wait

Total time: 15 minutes for 3 customers
```

### Async Approach (Smart Barista, Multitasks)
```
Customer 1 orders → Barista starts machine → while brewing...
Customer 2 orders → Barista starts machine → while brewing...
Customer 3 orders → Barista starts machine → while brewing...
All 3 ready → hand over

Total time: ~5 minutes for 3 customers
```

## In Python Code

### Synchronous (Blocking)
```python
import time

def make_coffee(person):
    print(f"Making coffee for {person}...")
    time.sleep(5)  # BLOCKS - nothing else can happen
    print(f"Done with {person}")
    return "Coffee"

# Sequential execution
make_coffee("Alice")   # Waits 5 seconds
make_coffee("Bob")     # Waits 5 seconds
make_coffee("Charlie") # Waits 5 seconds
# Total: 15 seconds
```

### Asynchronous (Non-blocking)
```python
import asyncio

async def make_coffee(person):
    print(f"Making coffee for {person}...")
    await asyncio.sleep(5)  # DOESN'T BLOCK - do other things meanwhile
    print(f"Done with {person}")
    return "Coffee"

# Concurrent execution
await asyncio.gather(
    make_coffee("Alice"),
    make_coffee("Bob"),
    make_coffee("Charlie")
)
# Total: ~5 seconds
```

## Key Differences

| Aspect | Sync | Async |
|--------|------|-------|
| **Execution** | Sequential | Concurrent |
| **Waiting** | Blocks everything | Allows other work |
| **Syntax** | Regular functions | `async`/`await` |
| **Performance** | Slower for I/O | Faster for I/O |
| **Complexity** | Simpler | More complex |

## When to Use Each

### Use Sync When:
- Script runs once and exits
- Simple, linear logic
- No I/O operations (or minimal)
- Running database migrations (Alembic)

### Use Async When:
- Web server handling many requests
- Multiple I/O operations (database, APIs)
- Real-time features (WebSockets)
- Need high concurrency

## Web Server Example

### Sync Web Server Problem
```
Request 1 comes in → Query database (2 seconds) → BLOCKS
  During those 2 seconds, Requests 2, 3, 4, 5 have to wait!
  With 100 concurrent users, performance is terrible
```

### Async Web Server Solution
```
Request 1 comes in → Start database query → handle Requests 2, 3, 4, 5 while waiting
  All requests are handled efficiently
  With 100 concurrent users, everyone gets fast response
```

## FastAPI & Async

FastAPI is built on async! That's why we use:
```python
@app.get("/users")
async def get_users():  # async function
    users = await db.query(...)  # await database query
    return users
```

## The Catch: Mixing Async and Sync

Some tools like Alembic are synchronous. When you mix them with async SQLAlchemy, you get conflicts (like our greenlet error!).

**Solution**: Use different drivers
- Async code uses `asyncpg` (async driver)
- Sync code uses `psycopg2` (sync driver)
- Both talk to same database, no conflicts

See: [Database Drivers](./database-drivers.md)
