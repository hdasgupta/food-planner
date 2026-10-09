import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { getPlan } from '../models/planModel.js';

function transporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass }
  });
}

const slotLabels = {
  breakfast: 'Breakfast',
  mid_morning: 'Mid-morning',
  lunch: 'Lunch',
  evening_snack: 'Evening Snack',
  dinner: 'Dinner'
};

export function renderMenuEmail(user, plan) {
  const groups = {};
  for (const item of plan.items) (groups[item.mealSlot] ||= []).push(item);

  const htmlGroups = Object.entries(slotLabels).map(([slot, label]) => {
    const items = groups[slot] || [];
    return `<h2>${label}</h2>${items.length
      ? `<ul>${items.map(i => `<li><strong>${escapeHtml(i.recipeName)}</strong> — ${i.quantity} ${escapeHtml(i.unit)} <em>(${escapeHtml(i.category)})</em></li>`).join('')}</ul>`
      : '<p>Not planned.</p>'}`;
  }).join('');

  return {
    subject: `Today's food menu — ${plan.plan_date}`,
    html: `<div style="font-family:Arial,sans-serif"><h1>Today's Homemade Food Menu</h1>
      <p>Hello ${escapeHtml(user.name)},</p><p>Your planned menu for <strong>${plan.plan_date}</strong>:</p>
      ${htmlGroups}
      ${plan.notes ? `<h2>Notes</h2><p>${escapeHtml(plan.notes)}</p>` : ''}
      <p>Enjoy your meal! — Food Planner</p></div>`
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

export async function sendDailyMenuEmail(user, date) {
  const mailer = transporter();
  if (!mailer) throw new Error('SMTP is not configured');

  const plan = await getPlan(user.id, date);
  if (!plan.items.length) return { skipped: true, reason: 'No planned menu' };

  const content = renderMenuEmail(user, plan);
  await mailer.sendMail({
    from: env.smtp.from,
    to: user.email,
    subject: content.subject,
    html: content.html
  });
  return { skipped: false };
}
