Fix: users.timezone missing

The application code selects users.timezone, but the existing PostgreSQL database has not had the schema update applied.

From the backend directory, run:
  npm run db:init

This runs backend/db/schema.sql, which already includes safe ALTER TABLE ... ADD COLUMN IF NOT EXISTS statements.

Alternatively, run the included SQL file directly against the same PostgreSQL database used by the app:
  psql "$DATABASE_URL" -f db/migrations/20261009_add_user_timezone.sql

If DATABASE_URL is not set locally, run the SQL in your database provider's SQL console against the app's actual database.
Restart/redeploy the backend after applying the migration. This does not delete user data.
