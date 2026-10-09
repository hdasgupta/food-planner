import cron from 'node-cron';
import { env } from '../config/env.js';
import { getOrGenerateMenu } from '../services/menuService.js';
import { sendMenuEmail } from '../services/emailService.js';
function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:env.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function startDailyMenuScheduler(){
  if(!cron.validate(env.dailyMenuCron)){console.error(`Invalid DAILY_MENU_CRON: ${env.dailyMenuCron}`);return null;}
  return cron.schedule(env.dailyMenuCron,async()=>{
    try{const date=today();const menu=await getOrGenerateMenu(date);await sendMenuEmail(menu);console.log(`Daily menu emailed for ${date}`);}catch(error){console.error('Daily menu scheduler failed:',error);}
  },{timezone:env.timezone});
}
