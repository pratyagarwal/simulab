# Backend Setup Guide

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed

### Start Services

```bash
cd backend

# Start PostgreSQL and Redis
docker-compose up -d

# Wait a few seconds for services to be ready
sleep 5

# Initialize database (run migrations)
bash scripts/init_db.sh
```

### Verify Setup

```bash
# Check services are running
docker-compose ps

# Connect to PostgreSQL
docker exec -it simulab-postgres psql -U simulab -d simulab

# In psql, verify tables exist:
\dt
\q  # Exit psql
```

### Stop Services

```bash
docker-compose down

# To remove data volumes (fresh start):
docker-compose down -v
```

## Local Development (without Docker)

### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis (optional, for WebSocket features)

### Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Update .env with your database URL
# DATABASE_URL=postgresql+asyncpg://your_user:your_pass@localhost:5432/simulab

# Run migrations
alembic upgrade head

# Start development server
uvicorn main:app --reload
```

API will be available at: http://localhost:8000
API docs (Swagger): http://localhost:8000/docs

## Database Migrations

### Create a new migration

```bash
alembic revision --autogenerate -m "Add new column"
```

### Apply migrations

```bash
alembic upgrade head
```

### Revert last migration

```bash
alembic downgrade -1
```

### Check migration status

```bash
alembic current
alembic history
```

## Docker Compose Services

### PostgreSQL
- Host: localhost
- Port: 5432
- User: simulab
- Password: simulab
- Database: simulab

### Redis
- Host: localhost
- Port: 6379

## Environment Variables

See `.env.example` for all configuration options.

Key variables for local development:
```bash
ENVIRONMENT=development
DATABASE_URL=postgresql+asyncpg://simulab:simulab@localhost:5432/simulab
SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379
```

## Troubleshooting

### PostgreSQL connection refused
- Check if Docker container is running: `docker-compose ps`
- Check if port 5432 is available
- Wait a bit longer for service startup (healthcheck takes ~10s)

### Alembic migration failed
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Check error message in console

### Redis connection issues
- Not critical for basic setup
- Will be needed for WebSocket features
- Check if Redis container is running

## Next Steps

1. Test models with database operations
2. Add Pydantic schemas (SIM-25)
3. Set up core infrastructure and API endpoints (SIM-26)
