@echo off
cd /d C:\Users\ma470\22yards\backend
set DJANGO_TEST_SQLITE=1
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\venv\Scripts\python.exe manage.py test
