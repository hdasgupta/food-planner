import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  emailApi: {
    url: process.env.GAS_EMAIL_API_URL || 'https://script.google.com/macros/s/AKfycbwBFlwZ-xXgjGXg2_jlsek2tm4nkIHuPn9WsOl4HV1onANS3Z7PLGou76Hl-TURuDtE/exec',
    apiKey: process.env.GAS_EMAIL_API_KEY || ''
  },
  dailyMenuCron: process.env.DAILY_MENU_CRON || '0 7 * * *',
  schedulerTimezone: process.env.SCHEDULER_TIMEZONE || 'Asia/Kolkata'
};

if (!env.databaseUrl) {
  console.warn('DATABASE_URL is not set.');
}
