# Greenlets: Lightweight Threading in Python

## What is a Greenlet?

A **greenlet** is a lightweight pseudo-thread managed by Python, not the operating system. It's like a mini-thread that uses minimal memory and can switch between tasks very quickly.

**Etymology**:
- "Green threads" = threads managed by language (not OS)
- "greenlet" = small/mini version of green threads
- Named this way because it's user-space threading

## Greenlets vs OS Threads

### OS Threads (Heavy)
```python
import threading

def task():
    print("Task running")

# Each thread is managed by the operating system
# Each thread uses ~1MB+ of memory
# Can realistically have hundreds/thousands

thread = threading.Thread(target=task)
thread.start()
```

**Characteristics**:
- Managed by OS
- Heavy (~1MB+ each)
- Context switching is expensive
- Hundreds at most

### Greenlets (Lightweight)
```python
from greenlet import greenlet

def task():
    print("Task running")

# Each greenlet is managed by Python
# Each greenlet uses ~few KB of memory
# Can have hundreds of thousands

gr = greenlet(task)
gr.switch()  # Start the greenlet
```

**Characteristics**:
- Managed by Python
- Lightweight (~few KB each)
- Context switching is fast
- Hundreds of thousands possible

## How Greenlets Work

Greenlets use **cooperative multitasking** - tasks voluntarily give up control.

```python
from greenlet import greenlet

def producer():
    for i in range(3):
        print(f"Producing item {i}")
        consumer_gr.switch(i)  # Pause me, let consumer run with data
    print("Producer done")

def consumer():
    while True:
        item = producer_gr.switch()  # Resume producer, get control
        if item is None:
            break
        print(f"  Consuming item {item}")
    print("Consumer done")

producer_gr = greenlet(producer)
consumer_gr = greenlet(consumer)

producer_gr.switch()  # Start
```

**Output**:
```
Producing item 0
  Consuming item 0
Producing item 1
  Consuming item 1
Producing item 2
  Consuming item 2
Producer done
Consumer done
```

**What happened**:
1. Producer creates item
2. Producer **voluntarily switches** to consumer (pauses itself)
3. Consumer processes
4. Consumer **switches back** to producer
5. Both run in **same OS thread** but take turns!

## Cooperative vs Preemptive

### Preemptive (OS Threads)
```
OS: "Thread 1, time's up! Thread 2, your turn!"
(OS forcefully interrupts mid-execution)
```
- More responsive but context switching overhead
- Risk of race conditions

### Cooperative (Greenlets)
```
Greenlet 1: "I'm at a good stopping point, Greenlet 2 go ahead"
(Greenlet voluntarily yields)
```
- Very fast switching
- Predictable (no random interrupts)
- But requires explicit yield points

## Why SQLAlchemy Uses Greenlets

### The Problem: Mixing Async and Sync

Modern Python has `async/await`, but SQLAlchemy needs to support:
- Async operations: `await session.execute(...)`
- Sync operations: `session.execute(...)`
- Lazy-loading relationships in both contexts

**Greenlets provide the bridge!**

### greenlet_spawn Function

When using async SQLAlchemy:

```python
# Your async code
async def get_user(session, user_id):
    user = await session.get(User, user_id)
    # What if User has relationships?
    # user.posts  ← How does SQLAlchemy know to fetch async?
    return user
```

**SQLAlchemy uses greenlet internally**:
```python
def greenlet_spawn(fn, *args):
    """Mark: 'We're in async context now'"""
    current_greenlet = greenlet.getcurrent()
    # Store: "This greenlet is in async mode"
    # When lazy-loading, SQLAlchemy knows to use await
    return fn(*args)
```

## Your Error: MissingGreenlet

```
sqlalchemy.exc.MissingGreenlet: greenlet_spawn has not been called
```

### What Happened

1. Your models configured for async SQLAlchemy (expects greenlets)
2. Alembic runs synchronously (no greenlets)
3. Alembic imports models
4. SQLAlchemy looks for greenlet context → not found!
5. Error! 💥

### Why This Matters

- **Async context**: SQLAlchemy can lazily load relationships using `await`
- **Sync context**: No greenlet, can't use `await`, BOOM

### The Solution

**Don't mix async and sync in the same context**

Use different drivers:
- **Async code** (FastAPI): Use `asyncpg` driver
- **Sync code** (Alembic): Use `psycopg2` driver

See: [Database Drivers](./database-drivers.md)

## Greenlets in the Wild

Greenlets aren't just for SQLAlchemy!

- **gevent**: Greenlet-based concurrency library
- **eventlet**: Another greenlet implementation
- **Go's goroutines**: Similar concept (inspired by greenlets!)
- **Ruby's fibers**: Ruby version of greenlets
- **Lua's coroutines**: Lua version

## Summary

- **Greenlets** = lightweight user-space threads
- **Cooperative** = they politely take turns
- **Fast** = very cheap to create and switch
- **SQLAlchemy uses them** to track async vs sync contexts
- **Your error** = tried to use async SQLAlchemy in sync context (no greenlet)
- **Fix** = separate drivers for async and sync code
