# Command Reference

Create Django project with Docker Compose:

```sh
docker compose run --rm backend sh -c "django-admin startproject backend ."

docker compose run --rm backend sh -c "python manage.py makemigrations && python manage.py migrate"

docker compose run --rm backend sh -c "python manage.py createsuperuser"

docker compose run --rm backend sh -c "python manage.py shell"

```

Start the development server:

```sh
clear && docker compose down && docker compose up --build
```


<!-- 
git add backend/newsletter
git commit -m 'feat: add newsletter'
git push origin main


git add frontend
git commit-m "bug:vibe coded and make soo many bug, seeing right now a bug what i donnow how to sove that's if i goto sign up page i automaticly redirect to otp page"
git push origin main


git add backend/users
git commit-m "fix: matched url front-end haha"
git push origin main
 -->