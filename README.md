# Setup steps for 22 Yards Project

## Backend Setup
1. Navigate to `backend/` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate venv: `.\venv\Scripts\activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create `.env` from example: `copy .env.example .env` and fill in your values.
6. Run migrations: `python manage.py migrate`
7. Create admin user: `python manage.py createsuperuser`
8. Start server: `python manage.py runserver`

## Frontend Setup
1. Navigate to `frontend/` directory.
2. Install dependencies: `npm ci`
3. Create `.env.local` from example: `copy .env.local.example .env.local`
4. Start development server: `npm run dev`
