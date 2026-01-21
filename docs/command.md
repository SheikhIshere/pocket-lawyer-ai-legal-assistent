# Command Reference

Create Django project with Docker Compose:

```sh
docker compose run --rm backend sh -c "django-admin startproject backend ."

docker compose run --rm backend sh -c "python manage.py makemigrations && python manage.py migrate"

docker compose run --rm backend sh -c "python manage.py createsuperuser"

docker compose run --rm backend sh -c "python manage.py shell"

docker compose run --rm backend sh -c "python manage.py startapp "

```

Start the development server:

```sh
clear && docker compose down && docker compose up --build
```
