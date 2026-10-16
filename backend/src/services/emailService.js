import { env } from '../config/env.js';
import { getPlan } from '../models/planModel.js';

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
  const plan = await getPlan(user.id, date);
  if (!plan.items.length) return { skipped: true, reason: 'No planned menu' };

  if (!env.emailApi?.url) throw new Error('Google Apps Script email API URL is not configured');

  const content = renderMenuEmail(user, plan);
  const payload = {
    to: user.email,
    subject: content.subject,
    htmlBody: content.html
  };
  // The API key is optional unless API_KEY is configured in Apps Script properties.
  if (env.emailApi.apiKey) payload.apiKey = env.emailApi.apiKey;

  let response;
  try {
    response = await fetch(env.emailApi.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    });
  } catch (error) {
    throw new Error(`Google Apps Script email API request failed: ${error.message}`);
  }

  const responseText = await response.text();
  let result;
  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(`Google Apps Script email API returned an invalid response (HTTP ${response.status})`);
  }

  if (!response.ok || result.success !== true) {
    throw new Error(result.message || `Google Apps Script email API failed (HTTP ${response.status})`);
  }

  return { skipped: false, message: result.message || 'Email sent successfully' };
}

// Backward-compatible handler for the legacy generated-menu email endpoint.
// The current planner email flow above remains unchanged.
export async function sendMenuEmail(menu, recipient) {
  if (!env.emailApi?.url) throw new Error('Google Apps Script email API URL is not configured');
  if (!recipient) throw new Error('Recipient email address is required');

  const labels = {
    breakfast: 'Breakfast',
    morning: 'Morning',
    mid_morning: 'Mid-morning',
    lunch: 'Lunch',
    evening: 'Evening Snack',
    evening_snack: 'Evening Snack',
    dinner: 'Dinner'
  };
  const groups = {};
  for (const item of menu.items || []) {
    const slot = item.meal_slot || item.mealSlot || 'other';
    (groups[slot] ||= []).push(item);
  }
  const htmlGroups = Object.entries(groups).map(([slot, items]) =>
    `<h2>${escapeHtml(labels[slot] || slot)}</h2><ul>${items.map(item => {
      const recipe = item.recipe || {};
      return `<li><strong>${escapeHtml(recipe.name || item.recipeName || 'Recipe')}</strong> <em>(${escapeHtml(recipe.category || item.category || '')})</em></li>`;
    }).join('')}</ul>`
  ).join('');
  const date = menu.menu_date || menu.plan_date || '';
  const payload = {
    to: recipient,
    subject: `Today's food menu — ${date}`,
    htmlBody: `<div style="font-family:Arial,sans-serif"><h1>Today's Homemade Food Menu</h1><p>Your menu for <strong>${escapeHtml(date)}</strong>:</p>${htmlGroups}${menu.notes ? `<h2>Notes</h2><p>${escapeHtml(menu.notes)}</p>` : ''}<p>Enjoy your meal! — Food Planner</p></div>`
  };
  if (env.emailApi.apiKey) payload.apiKey = env.emailApi.apiKey;

  let response;
  try {
    response = await fetch(env.emailApi.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    });
  } catch (error) {
    throw new Error(`Google Apps Script email API request failed: ${error.message}`);
  }
  const responseText = await response.text();
  let result;
  try { result = JSON.parse(responseText); }
  catch { throw new Error(`Google Apps Script email API returned an invalid response (HTTP ${response.status})`); }
  if (!response.ok || result.success !== true) {
    throw new Error(result.message || `Google Apps Script email API failed (HTTP ${response.status})`);
  }
  return { messageId: result.messageId || result.id || result.message || 'sent' };
}
