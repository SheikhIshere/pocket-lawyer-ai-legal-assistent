FROM python:3.12-slim-bookworm

ENV PYTHONUNBUFFERED 1

# Copy requirements first (Docker layer caching)
COPY ./requirements.txt /requirements.txt

# Install OS dependencies + Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        curl \
    && pip install --upgrade pip \
    && pip install -r /requirements.txt \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY ./backend /backend
WORKDIR /backend

# Default command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
