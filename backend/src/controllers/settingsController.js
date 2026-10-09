import { getEmailSettings, upsertEmailSettings } from '../models/settingsModel.js';
export async function get(req,res,next){try{res.json({data:await getEmailSettings()});}catch(e){next(e)}}
export async function save(req,res,next){try{if(!req.body.recipient_email)return res.status(400).json({error:'recipient_email is required'});res.json({data:await upsertEmailSettings(req.body.recipient_email,req.body.enabled!==false)});}catch(e){next(e)}}
