# Tests

Shared test infrastructure and fixtures for SimuLab.

## Structure

- `conftest.py` - Pytest configuration and fixtures
- `integration/` - Integration tests
- `unit/` - Unit tests
- `fixtures/` - Test data and mocks
- `utils.py` - Test utilities

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov

# Run specific test file
pytest tests/integration/test_chat.py

# Run with markers
pytest -m integration
```

## Development

See [CONTRIBUTING.md](../.github/CONTRIBUTING.md) for setup instructions.
