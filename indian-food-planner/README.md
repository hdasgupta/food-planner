# Indian Homemade Food Planner

A full-stack daily Indian homemade vegetarian food planner with egg recipes.

## Stack

- Backend: Node.js + Express + PostgreSQL + JWT + Nodemailer + node-cron
- Frontend: React + Vite + React Router
- Android: Capacitor-ready React frontend
- Deployment: backend on Render, frontend on Vercel, PostgreSQL anywhere compatible with `DATABASE_URL`

## Features

- Registration/login with JWT.
- Master Indian homemade menu catalog, organized as:
  - Drink
  - Main Course
  - Side Dish
  - Dal
  - Rice
  - Indian Bread
  - Snack
  - Dessert
  - Egg Recipe
  - Chutney
  - Pickle
  - Salad
- Daily planner with:
  - Breakfast
  - Mid-morning
  - Lunch
  - Evening snack
  - Dinner
- Each meal can contain multiple menu items.
- Search/filter the master catalog.
- Create, replace and remove planned items.
- Daily menu view for any date.
- Daily email containing the current day's planned menu.
- Cron scheduler runs at 07:00 IST by default.
- Idempotency prevents duplicate daily email for the same user/date.
- Seed script loads a large curated original recipe catalog.
- Health/readiness endpoints for Render.
- CORS, helmet, rate limiting and parameterized SQL.
- API is versioned under `/api`.

## Local setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:init
npm run db:seed
npm run dev
```

Backend defaults to `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend defaults to `http://localhost:5173`.

## PostgreSQL

Local database name is `postgres` as requested. The example connection is:

```text
postgresql://postgres:postgres@localhost:5432/postgres
```

Change the username/password as needed.

## Production

### Render backend

Set:

- `NODE_ENV=production`
- `PORT` is supplied by Render
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- SMTP variables

Start command:

```bash
npm start
```

Build command:

```bash
npm install
```

Seed once:

```bash
npm run db:init
npm run db:seed
```

### Vercel frontend

Set:

```text
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

### Email

SMTP is intentionally provider-neutral. Use Gmail SMTP, SendGrid SMTP, Mailgun SMTP, Amazon SES SMTP, etc.

Required:

```text
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
MAIL_FROM
```

Optional:

```text
DAILY_MENU_CRON=0 7 * * *
SCHEDULER_TIMEZONE=Asia/Kolkata
```

## Capacitor Android

From `frontend`:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

The web app remains the source of truth. Android is a wrapper around the same React application.

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/recipes`
- `GET /api/recipes/:id`
- `GET /api/categories`
- `GET /api/plans/:date`
- `PUT /api/plans/:date`
- `POST /api/plans/:date/items`
- `DELETE /api/plans/:date/items/:id`
- `GET /api/health`
- `GET /api/ready`

## Seed data

The seed catalog is an original, curated Indian homemade menu starter catalog. It is designed to be expanded safely without copying a third-party database verbatim. Every seed recipe contains preparation guidance and ingredient text.

For a commercial product, review regional naming, dietary/allergen information and recipe licensing before adding externally sourced datasets.
