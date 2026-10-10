function parseSerialized(value) {
  if (typeof value !== 'string') return value;
  const text = value.trim();
  if (!text) return '';
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function ingredientText(item) {
  if (item == null) return { item: '', quantity: '', unit: '', original: '' };
  if (typeof item !== 'object') return { item: String(item).trim(), quantity: '', unit: '', original: String(item).trim() };
  const name = String(item.item ?? item.name ?? item.ingredient ?? item.title ?? '').trim();
  const quantity = String(item.quantity ?? item.amount ?? item.qty ?? '').trim();
  const unit = String(item.unit ?? '').trim();
  const original = String(item.original ?? [quantity, unit, name].filter(Boolean).join(' ')).trim();
  return { item: name, quantity, unit, original };
}

export function formatIngredients(value) {
  const parsed = parseSerialized(value);
  if (parsed == null || parsed === '') return [];
  let values;
  if (Array.isArray(parsed)) values = parsed;
  else if (typeof parsed === 'object') values = Object.entries(parsed).map(([key, item]) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) return { item: item.item ?? item.name ?? key, ...item };
    return { item: key, quantity: item, original: `${key}: ${item}` };
  });
  else values = String(parsed).split(/\n+|\s*;\s*|\s*,\s*/).map(item => item.trim().replace(/^(?:[-*•]|\d+[.)])\s*/, '')).filter(Boolean);
  return values.map(ingredientText).filter(item => item.item || item.quantity || item.original);
}

export function formatPreparationSteps(value) {
  const parsed = parseSerialized(value);
  if (parsed == null || parsed === '') return [];

  let rawSteps;
  if (Array.isArray(parsed)) {
    rawSteps = parsed;
  } else if (typeof parsed === 'object') {
    rawSteps = Object.values(parsed);
  } else {
    const text = String(parsed).trim();
    // Support both numbered steps on separate lines and inline sequences such as "1. Mix. 2. Cook.".
    rawSteps = text
      .split(/\n+/)
      .flatMap(line => line.trim().split(/\s+(?=\d+[.)]\s+)/))
      .filter(Boolean);
  }

  return rawSteps.map(step => {
    let text = typeof step === 'object' && step !== null
      ? String(step.instruction ?? step.step ?? step.text ?? ingredientText(step))
      : String(step);
    return text.trim().replace(/^(?:(?:step\s*)?\d+[.)]|[-*•])\s*/i, '').trim();
  }).filter(Boolean);
}
