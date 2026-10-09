import cron from 'node-cron';
import { env } from '../config/env.js';
import { listEmailUsers } from '../models/userModel.js';
import { alreadySent, markSent } from '../models/emailLogModel.js';
import { sendDailyMenuEmail } from '../services/emailService.js';

export function currentDateInTimezone(timezone = env.schedulerTimezone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function startDailyMenuScheduler() {
  cron.schedule(env.dailyMenuCron, async () => {
    try {
      const users = await listEmailUsers();
      const date = currentDateInTimezone();
      for (const user of users) {
        try {
          if (await alreadySent(user.id, date)) continue;
          const result = await sendDailyMenuEmail(user, date);
          if (!result.skipped) await markSent(user.id, date);
        } catch (error) {
          console.error(`Daily menu email failed for ${user.email}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Daily menu scheduler run failed:', error.message);
    }
  }, { timezone: env.schedulerTimezone });
  console.log(`Daily menu scheduler enabled: ${env.dailyMenuCron} (${env.schedulerTimezone})`);
}
