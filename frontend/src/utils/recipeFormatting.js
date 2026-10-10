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
  if (item == null) return '';
  if (typeof item !== 'object') return String(item).trim();

  const name = item.name ?? item.ingredient ?? item.item ?? item.title ?? '';
  const amount = item.amount ?? item.quantity ?? item.qty ?? '';
  const unit = item.unit ?? '';
  const detail = [amount, unit].filter(Boolean).join(' ');
  if (name || detail) return [detail, name].filter(Boolean).join(' ').trim();

  return Object.entries(item)
    .map(([key, value]) => `${key.replace(/[_-]/g, ' ')}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join(' · ');
}

export function formatIngredients(value) {
  const parsed = parseSerialized(value);
  if (parsed == null || parsed === '') return [];
  if (Array.isArray(parsed)) return parsed.map(ingredientText).filter(Boolean);
  if (typeof parsed === 'object') {
    return Object.entries(parsed).map(([key, item]) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) return ingredientText(item);
      const label = String(key).replace(/[_-]/g, ' ').trim();
      const detail = ingredientText(item);
      return label && detail ? `${label}: ${detail}` : (detail || label);
    }).filter(Boolean);
  }

  return String(parsed)
    .split(/\n+|\s*;\s*|\s*,\s*/)
    .map(item => item.trim().replace(/^(?:[-*•]|\d+[.)])\s*/, ''))
    .filter(Boolean);
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
