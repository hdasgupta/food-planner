-- Add the user timezone preference to existing databases.
-- Safe to run more than once.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(80) NOT NULL DEFAULT 'Asia/Kolkata';

-- Keep the email preference column compatible with older installations too.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN NOT NULL DEFAULT TRUE;
