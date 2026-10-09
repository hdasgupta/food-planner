import cron from 'node-cron';
import { env } from '../config/env.js';
import { listEmailUsers } from '../models/userModel.js';
import { alreadySent, markSent } from '../models/emailLogModel.js';
import { sendDailyMenuEmail } from './emailService.js';

export function currentDateInTimezone(timezone = env.schedulerTimezone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

export function startDailyMenuScheduler() {
  cron.schedule(env.dailyMenuCron, async () => {
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
  }, { timezone: env.schedulerTimezone });
  console.log(`Daily menu scheduler enabled: ${env.dailyMenuCron} (${env.schedulerTimezone})`);
}
