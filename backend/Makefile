.PHONY: help format lint test clean install dev

# Default target
help:
	@echo "Available commands:"
	@echo "  install     Install dependencies"
	@echo "  dev         Install development dependencies"
	@echo "  format      Format code with black and isort"
	@echo "  lint        Run linting with flake8"
	@echo "  test        Run tests with pytest"
	@echo "  check       Run format, lint and test"
	@echo "  clean       Clean up temporary files"
	@echo "  run         Start the development server"

# Install dependencies
install:
	poetry install --no-dev

# Install development dependencies
dev:
	poetry install

# Format code
format:
	poetry run black .
	poetry run isort .

# Lint code
lint:
	poetry run flake8 .

# Run tests
test:
	poetry run pytest

# Run all checks
check: format lint test

# Clean temporary files
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type f -name ".coverage" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +

# Start development server
run:
	PYTHONPATH=/home/meakd/ndash/backend poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
