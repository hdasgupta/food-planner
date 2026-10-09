import { getOrGenerateMenu, generateMenu } from '../services/menuService.js';
import { sendMenuEmail } from '../services/emailService.js';
function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:process.env.APP_TIMEZONE||'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export async function todayMenu(req,res,next){try{res.json({data:await getOrGenerateMenu(req.query.date||today())});}catch(e){next(e)}}
export async function regenerate(req,res,next){try{res.json({data:await generateMenu(req.body.date||today())});}catch(e){next(e)}}
export async function emailToday(req,res,next){try{const menu=await getOrGenerateMenu(req.body.date||today()); const info=await sendMenuEmail(menu,req.body.recipient); res.json({message:'Menu email sent',messageId:info.messageId,date:menu.menu_date});}catch(e){next(e)}}
