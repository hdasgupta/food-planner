import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'Indian Food Planner <no-reply@example.com>'
  },
  dailyMenuCron: process.env.DAILY_MENU_CRON || '0 7 * * *',
  schedulerTimezone: process.env.SCHEDULER_TIMEZONE || 'Asia/Kolkata'
};

if (!env.databaseUrl) {
  console.warn('DATABASE_URL is not set.');
}
